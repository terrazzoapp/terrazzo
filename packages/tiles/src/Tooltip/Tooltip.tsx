import type {
  TooltipProps as RadixTooltipProps,
  TooltipArrowProps,
  TooltipContentProps,
  TooltipPortalProps,
  TooltipTriggerProps,
} from '@radix-ui/react-tooltip';
import { Arrow, Content, Portal, Provider, Root, Trigger } from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';
import './Tooltip.css';

export interface TooltipProps extends RadixTooltipProps {
  arrowProps?: TooltipArrowProps;
  children: ReactNode;
  content: ReactNode;
  contentProps?: TooltipContentProps;
  portalProps?: TooltipPortalProps;
  providerProps?: TooltipProviderProps;
  triggerProps?: TooltipTriggerProps;
}

// copied; not exported
interface TooltipProviderProps {
  children: ReactNode;
  /**
   * The duration from when the pointer enters the trigger until the tooltip gets opened.
   * @defaultValue 700
   */
  delayDuration?: number;
  /**
   * How much time a user has to enter another trigger without incurring a delay again.
   * @defaultValue 300
   */
  skipDelayDuration?: number;
  /**
   * When `true`, trying to hover the content will result in the tooltip closing as the pointer leaves the trigger.
   * @defaultValue false
   */
  disableHoverableContent?: boolean;
}

export default function Tooltip({
  arrowProps,
  children,
  contentProps,
  portalProps,
  content,
  triggerProps,
  providerProps,
  ...rest
}: TooltipProps) {
  return (
    <Provider delayDuration={0} {...providerProps}>
      <Root {...rest}>
        <Trigger asChild {...triggerProps} className='tz-tooltip-trigger'>
          {children}
        </Trigger>
        <Portal {...portalProps}>
          <Content sideOffset={5} {...contentProps} className='tz-tooltip-content'>
            {content}
            <Arrow {...arrowProps} className='tz-tooltip-arrow' />
          </Content>
        </Portal>
      </Root>
    </Provider>
  );
}
