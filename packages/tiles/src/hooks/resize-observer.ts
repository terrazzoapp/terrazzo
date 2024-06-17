import { useState, type MutableRefObject, useEffect } from 'react';

/** Use performant Resize Observer */
export default function useResizeObserver<T extends MutableRefObject<HTMLElement | null>>(el: T): DOMRect {
  const [domRect, setDomRect] = useState<DOMRect>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  } as DOMRect);
  useEffect(() => {
    if (!el.current) {
      return;
    }
    const ro = new ResizeObserver(([entry]) => {
      if (entry) {
        setDomRect(entry.contentRect);
      }
    });
    ro.observe(el.current);
    return () => {
      ro.disconnect();
    };
  }, [el.current]);
  return domRect;
}
