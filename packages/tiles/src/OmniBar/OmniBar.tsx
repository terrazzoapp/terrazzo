import clsx from 'clsx';
import { type ComponentProps, type ReactElement, useCallback, useEffect, useId, useRef, useState } from 'react';
import Kbd from '../Kbd/Kbd.js';
import './OmniBar.css';

export interface OmniBarResultProps extends ComponentProps<'li'> {}

export function OmniBarResult({ className, children, ...rest }: OmniBarResultProps) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: ignore
    // biome-ignore lint/a11y/useAriaPropsForRole: ignore
    // biome-ignore lint/a11y/useFocusableInteractive: ignore
    // biome-ignore lint/a11y/useSemanticElements: ignore
    <li className={clsx('tz-omnibar-result', className)} role='option' {...rest}>
      {children}
    </li>
  );
}

export interface OmniBarProps extends ComponentProps<'input'> {
  /** Expanded on initial render? (default: false) */
  defaultExpanded?: boolean;
  /** placeholder text  */
  placeholder: string;
  /** (optional) If a key command should open this */
  keyCommand: string;
  /** Expanded callback */
  onExpand?: (expanded: boolean) => void;
  /** Callback for `Enter` pressed on selected item */
  onEnter?: (activeItem: number) => void;
  /** (optional) Description for search results */
  resultDescription?: ReactElement;
}

export function OmniBar({
  'aria-label': ariaLabel,
  className,
  children,
  defaultExpanded = false,
  placeholder,
  keyCommand = '/',
  onExpand,
  onEnter,
  onChange,
  resultDescription,
  ...rest
}: OmniBarProps) {
  const listboxId = useId();
  const resultDescId = useId();
  const wrapperEl = useRef<HTMLFormElement>(null);
  const listboxEl = useRef<HTMLUListElement>(null);

  const [expanded, setExpanded] = useState(defaultExpanded);
  const [activeItem, setActiveItem] = useState(0);

  const getOptions = useCallback(() => {
    if (listboxEl.current) {
      return listboxEl.current.querySelectorAll('[role=option]');
    }
    return [];
  }, [expanded, listboxEl.current]);

  // expand reactivity
  useEffect(() => {
    if (!keyCommand) {
      return;
    }

    function handleKeyDown(evt: KeyboardEvent) {
      if ((evt.key === keyCommand || evt.key === keyCommand.toLowerCase()) && !evt.shiftKey && !evt.metaKey) {
        if (document.activeElement?.nodeName !== 'INPUT') {
          wrapperEl.current?.querySelector('input')?.focus();
          evt.preventDefault();
        }
      }
      switch (evt.key) {
        case 'ArrowUp': {
          evt.preventDefault();
          const options = getOptions();
          setActiveItem((value) => (value <= 0 ? options.length - 1 : value - 1));
          break;
        }
        case 'ArrowDown': {
          evt.preventDefault();
          const options = getOptions();
          setActiveItem((value) => (value >= options.length - 1 ? 0 : value + 1));
          break;
        }
        case 'Home': {
          evt.preventDefault();
          setActiveItem(0);
          break;
        }
        case 'End': {
          evt.preventDefault();
          const options = getOptions();
          setActiveItem(options.length - 1);
          break;
        }
        case 'Escape': {
          setExpanded(false);
          break;
        }
      }
    }

    addEventListener('keydown', handleKeyDown);

    return () => {
      removeEventListener('keydown', handleKeyDown);
    };
  }, [keyCommand, getOptions, setActiveItem, setExpanded]);

  // expanded listener
  useEffect(() => {
    if (onExpand) {
      onExpand(expanded);
    }
  }, [expanded, onExpand]);

  // apply activeItem
  useEffect(() => {
    if (listboxEl.current) {
      listboxEl.current.querySelectorAll('[role=option]').forEach((el, i) => {
        if (i === activeItem) {
          el.setAttribute('aria-selected', 'true');
          el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        } else {
          el.removeAttribute('aria-selected');
        }
      });
    }
  }, [activeItem, expanded]);

  // click listener
  useEffect(() => {
    function handleClick(evt: Event) {
      if (!(evt.target as HTMLElement).closest('.tz-omnibar')) {
        setExpanded(false);
      }
    }
    addEventListener('click', handleClick);
    return () => {
      removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <form ref={wrapperEl} className={clsx('tz-omnibar', className)} noValidate data-expanded={expanded}>
      <div className='tz-omnibar-inputwrap'>
        <input
          className='tz-omnibar-input'
          type='search'
          role='combobox'
          aria-label={ariaLabel}
          aria-controls={listboxId}
          aria-expanded={expanded}
          placeholder={placeholder}
          onChange={(evt) => {
            setExpanded(true);
            onChange?.(evt);
          }}
          onKeyDown={(evt) => {
            switch (evt.key) {
              case 'ArrowUp': {
                evt.preventDefault();
                evt.stopPropagation();
                const options = getOptions();
                setActiveItem((value) => (value <= 0 ? options.length - 1 : value - 1));
                break;
              }
              case 'ArrowDown': {
                evt.preventDefault();
                evt.stopPropagation();
                const options = getOptions();
                setActiveItem((value) => (value >= options.length - 1 ? 0 : value + 1));
                break;
              }
              case 'Home': {
                evt.preventDefault();
                evt.stopPropagation();
                setActiveItem(0);
                break;
              }
              case 'End': {
                evt.preventDefault();
                evt.stopPropagation();
                const options = getOptions();
                setActiveItem(options.length - 1);
                break;
              }
              case 'Enter': {
                evt.preventDefault();
                evt.stopPropagation();
                onEnter?.(activeItem);
                break;
              }
              case 'Escape': {
                setExpanded(false);
                evt.preventDefault();
                evt.stopPropagation();
                (evt.target as HTMLInputElement).value === '';
                (evt.target as HTMLInputElement).blur();
                break;
              }
            }
          }}
          onClick={() => setExpanded(true)} // note: there are some interactions where we’re still focused, but listbox closes; open again on click
          onFocus={() => setExpanded(true)}
          {...rest}
        />
        {keyCommand && <Kbd>{keyCommand}</Kbd>}
      </div>
      {expanded && (
        <div className='tz-omnibar-listboxwrapper'>
          {resultDescription && (
            <div id={resultDescId} className='tz-omnibar-resultdesc'>
              {resultDescription}
            </div>
          )}
          <ul
            ref={listboxEl}
            id={listboxId}
            className='tz-omnibar-listbox'
            // biome-ignore lint/a11y/useSemanticElements: ignore
            // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: why tho?
            role='listbox'
            aria-describedby={resultDescription ? resultDescId : undefined}
          >
            {children}
          </ul>
        </div>
      )}
    </form>
  );
}
