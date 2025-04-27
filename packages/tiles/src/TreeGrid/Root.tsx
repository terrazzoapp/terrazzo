import clsx from 'clsx';
import { type ComponentProps, createContext, type KeyboardEvent, type MouseEvent, useRef, useState } from 'react';
import { addToSet, removeFromSet } from '../lib/set.js';

export const Context = createContext({
  expanded: new Set<string>(),
  selected: new Set<string>(),
  registerID: (
    // @ts-expect-error just for types
    parentID: string,
    // @ts-expect-error just for types
    id: string,
  ) => {},
});

export interface RootProps extends ComponentProps<'table'> {
  /** Set initial expanded values */
  defaultExpanded?: string[];
  /** Set initial selected values */
  defaultSelected?: string[];
  /** Callback whenever a group is expanded or collapsed */
  onExpandGroups?: (ids: string[]) => void;
  /** Callback whenever a group or item is selected/deselected */
  onSelectItems?: (ids: string[]) => void;
}

export default function Root({
  children,
  className,
  defaultExpanded = [],
  defaultSelected = [],
  onClick,
  onExpandGroups,
  onKeyUp,
  onSelectItems,
  ...rest
}: RootProps) {
  const [expanded, setExpanded] = useState(new Set(defaultExpanded));
  const [selected, setSelected] = useState(new Set(defaultSelected));
  const [ll, setLL] = useState<Record<string, string[]>>({});

  const rowGroupEl = useRef<HTMLTableSectionElement>(null);

  const expand = (id: string) => {
    const nextValue = addToSet(id);
    setExpanded(nextValue);
    onExpandGroups?.([...nextValue(expanded)]);
  };
  const collapse = (id: string) => {
    const nextValue = removeFromSet(id);
    setExpanded(nextValue);
    onExpandGroups?.([...nextValue(expanded)]);
  };
  const select = (id: string) => {
    const nextValue = addToSet(id);
    setSelected(nextValue);
    onSelectItems?.([...nextValue(selected)]);
  };
  const selectOnly = (id: string) => {
    const nextValue = new Set([id]);
    setSelected(nextValue);
    onSelectItems?.([...nextValue]);
  };
  const deselect = (id: string) => {
    const nextValue = removeFromSet(id);
    setSelected(nextValue);
    onSelectItems?.([...nextValue(selected)]);
  };

  /** @see https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/ */
  function handleKeyDown(ev: KeyboardEvent<HTMLTableElement>) {
    onKeyUp?.(ev);

    const item = closestItem(ev.target as HTMLElement);
    const group = item ? null : closestGroup(ev.target as HTMLElement);
    if (!item && !group) {
      return;
    }

    switch (ev.key) {
      case 'a': {
        if (ev.metaKey) {
          setSelected(new Set(Object.keys(ll)));
          ev.preventDefault();
        }
        break;
      }
      case 'ArrowRight': {
        if (group) {
          if (!expanded.has(group.id)) {
            expand(group.id);
            ev.preventDefault();
          }
        }
        break;
      }
      case 'ArrowLeft': {
        if (group) {
          if (expanded.has(group.id)) {
            collapse(group.id);
            ev.preventDefault();
          }
        }
        break;
      }
      case 'ArrowUp': {
        let prev: HTMLElement | undefined;
        const siblings = (group || item)!.parentNode!.children ?? [];
        for (let i = 0; i < siblings.length; i++) {
          const sibling = siblings[i] as HTMLElement;
          if (sibling === (group || item)) {
            break;
          }
          if (sibling.hasAttribute('hidden')) {
            continue;
          }
          prev = sibling;
        }
        if (prev) {
          if (ev.shiftKey) {
            // TODO: this behavior is complex! It must:
            // - remember the originating focus element
            // - select everything BETWEEN the originating focus element & this
          }
          (prev.querySelector('[tabindex]') as HTMLElement | null)?.focus();
          ev.preventDefault();
        }
        break;
      }
      case 'ArrowDown': {
        let next: HTMLElement | undefined;
        let foundCurrent = false;
        const siblings = (group || item)!.parentNode!.children ?? [];
        for (let i = 0; i < siblings.length; i++) {
          const sibling = siblings[i] as HTMLElement;
          if (sibling === (group || item)) {
            foundCurrent = true;
            continue;
          }
          if (!foundCurrent || sibling.hasAttribute('hidden')) {
            continue;
          }
          next = sibling;
          break;
        }
        if (next) {
          if (ev.shiftKey) {
            // TODO: this behavior is complex! It must:
            // - remember the originating focus element
            // - select everything BETWEEN the originating focus element & this
          }
          (next.querySelector('[tabindex]') as HTMLElement | null)?.focus();
          ev.preventDefault();
        }
        break;
      }
      case 'Enter': {
        if (group) {
          if (!expanded.has(group.id)) {
            expand(group.id);
          } else {
            collapse(group.id);
          }
        } else {
          selectOnly(item!.id);
        }
        ev.preventDefault();
        break;
      }
      case ' ': {
        // note: weirdly enough, this is standard behavior—ONLY select for Shift + Space (not Space alone)
        if (ev.shiftKey) {
          selectOnly((group || item)!.id);
          ev.preventDefault();
        }
        if (ev.metaKey) {
          setSelected(new Set(Object.keys(ll)));
          ev.preventDefault();
        }
        break;
      }
    }
  }

  function handleClick(ev: MouseEvent<HTMLTableElement>) {
    onClick?.(ev);

    const item = closestItem(ev.target as HTMLElement);
    const group = item ? null : closestGroup(ev.target as HTMLElement);
    if (!item && !group) {
      return;
    }

    if (group) {
      if (!expanded.has(group.id)) {
        expand(group.id);
      } else {
        collapse(group.id);
      }
    }

    // Shift + click: add/remove from selection
    if (ev.shiftKey) {
      // TODO: select in between
      if (selected.has((group || item)!.id)) {
        deselect((group || item)!.id);
      } else {
        select((group || item)!.id);
      }
    }
    // Normal click: select only this
    else {
      selectOnly((group || item)!.id);
    }
  }

  return (
    <table
      aria-multiselectable='true'
      {...rest}
      className={clsx('tz-treegrid-root', className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <tbody ref={rowGroupEl} className='tz-treegrid-rowgroup'>
        <Context.Provider
          value={{
            expanded,
            selected,
            registerID: (parentID, id: string) => {
              if (!parentID) {
                throw new Error('parentID missing');
              }
              if (!id) {
                throw new Error('id missing');
              }
              if (id in ll) {
                // TODO: do we need to warn here if something is re-rendered?
                // throw new Error(`ID "${id}" already registered`);
                return;
              }
              setLL((value) => ({
                ...value,
                [parentID]: [...(value[parentID] ?? []), id], // note: under normal circumstances we could guarantee that parentID already exists, but React is not guaranteed to render in a particular order. Enforce uniqueness, but not order here.
                [id]: [],
              }));
            },
          }}
        >
          {children}
        </Context.Provider>
      </tbody>
    </table>
  );
}

function closestGroup(el: HTMLElement) {
  return el.closest('[data-treegrid-group]');
}

function closestItem(el: HTMLElement) {
  return el.closest('[data-treegrid-item]');
}
