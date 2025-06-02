import {
  Content,
  Icon,
  Portal,
  SelectItem as RadixSelectItem,
  type SelectItemProps as RadixSelectItemProps,
  SelectLabel as RadixSelectLabel,
  type SelectProps as RadixSelectProps,
  Root,
  ScrollDownButton,
  ScrollUpButton,
  SelectItemIndicator,
  SelectItemText,
  type SelectLabelProps,
  Trigger,
  Value,
  Viewport,
} from '@radix-ui/react-select';
import { CaretSort, Check, ChevronDown, ChevronUp } from '@terrazzo/icons';
import clsx from 'clsx';
import type { CSSProperties, ForwardedRef, ReactNode } from 'react';
import './Select.css';

export { Group as SelectGroup, Separator as SelectSeparator } from '@radix-ui/react-select';

export interface SelectItemProps extends RadixSelectItemProps {
  /** Show icon next to this item? */
  icon?: ReactNode;
  ref?: ForwardedRef<HTMLDivElement>;
}

export function SelectItem({ className, children, icon, ref, ...rest }: SelectItemProps) {
  return (
    <RadixSelectItem ref={ref} className={clsx('tz-select-item', className)} {...rest}>
      <SelectItemText>
        <span className='tz-select-item-inner'>
          <span className='tz-select-item-icon'>{icon}</span>
          <span className='tz-select-item-label'>{children}</span>
        </span>
      </SelectItemText>
      <SelectItemIndicator className='tz-select-item-indicator'>
        <Check />
      </SelectItemIndicator>
    </RadixSelectItem>
  );
}

export function SelectLabel({ className, children, ...rest }: SelectLabelProps) {
  return (
    <RadixSelectLabel className={clsx('tz-select-label', className)} {...rest}>
      {children}
    </RadixSelectLabel>
  );
}

export interface SelectProps extends RadixSelectProps {
  className?: string;
  /** Render trigger content */
  trigger?: ReactNode;
  /** Change trigger icon  */
  triggerIcon?: ReactNode;
  scrollUpIcon?: ReactNode;
  scrollDownIcon?: ReactNode;
  style?: CSSProperties;
}

export default function Select({
  children,
  className,
  defaultOpen,
  defaultValue,
  onOpenChange,
  onValueChange,
  scrollDownIcon,
  scrollUpIcon,
  style,
  trigger,
  triggerIcon,
  value,
  ...rest
}: SelectProps) {
  return (
    <Root
      defaultOpen={defaultOpen}
      defaultValue={defaultValue}
      onOpenChange={onOpenChange}
      onValueChange={onValueChange}
      value={value}
    >
      <Trigger {...rest} className={clsx('tz-select-trigger', className)} style={style}>
        <Value placeholder={<span className='tz-select-trigger-inner'>{trigger}</span>} />
        <Icon className='tz-select-icon'>{triggerIcon ?? <CaretSort />}</Icon>
      </Trigger>
      <Portal>
        <Content className='tz-select-options'>
          <ScrollUpButton className='tz-select-scroll-button tz-select-scroll-button__up'>
            {scrollUpIcon ?? <ChevronUp />}
          </ScrollUpButton>
          <Viewport className='tz-select-viewport'>{children}</Viewport>
          <ScrollDownButton className='tz-select-scroll-button tz-select-scroll-button__down'>
            {scrollDownIcon ?? <ChevronDown />}
          </ScrollDownButton>
        </Content>
      </Portal>
    </Root>
  );
}
