import { type ComponentProps, useEffect, useRef, useState, memo } from 'react';
import { HueWheel as HueWheelWebGL } from '../lib/webgl.js';

export type HueWheelProps = ComponentProps<'canvas'>;

function HueWheel({ ...rest }: HueWheelProps) {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const [webgl, setWebgl] = useState<HueWheelWebGL | undefined>();

  // initialize
  useEffect(() => {
    if (webgl || !canvasEl.current) {
      return;
    }
    setWebgl(new HueWheelWebGL({ canvas: canvasEl.current }));
  }, [canvasEl.current, webgl]);

  return <canvas ref={canvasEl} {...rest} />;
}

export default memo(HueWheel);
