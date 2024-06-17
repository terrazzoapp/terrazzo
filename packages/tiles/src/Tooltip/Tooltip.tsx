import type {
  TooltipProps as RadixTooltipProps,
  TooltipArrowProps,
  TooltipContentProps,
  TooltipPortalProps,
  TooltipProviderProps,
  TooltipTriggerProps,
} from '@radix-ui/react-tooltip';
import { Arrow, Content, Root, Portal, Provider, Trigger } from '@radix-ui/react-tooltip';
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
        <Trigger asChild {...triggerProps} className="tz-tooltip-trigger">
          {children}
        </Trigger>
        <Portal {...portalProps}>
          <Content sideOffset={5} {...contentProps} className="tz-tooltip-content">
            {content}
            <Arrow {...arrowProps} className="tz-tooltip-arrow" />
          </Content>
        </Portal>
      </Root>
    </Provider>
  );
}
