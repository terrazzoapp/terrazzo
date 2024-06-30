import { type ComponentProps, useEffect, useRef, useState, memo } from 'react';
import { GradientRGB, type WebGLColor } from '../lib/webgl.js';

export interface TrueGradientProps extends ComponentProps<'canvas'> {
  start: WebGLColor;
  end: WebGLColor;
}

function TrueGradient({ start, end, ...rest }: TrueGradientProps) {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const [webgl, setWebgl] = useState<GradientRGB | undefined>();

  // initialize
  useEffect(() => {
    if (webgl || !canvasEl.current) {
      return;
    }
    setWebgl(new GradientRGB({ canvas: canvasEl.current, startColor: start, endColor: end }));
  }, [canvasEl.current, webgl]);

  // update color
  useEffect(() => {
    if (webgl) {
      webgl.setColors(start, end);
    }
  }, [start, end, webgl]);

  return <canvas ref={canvasEl} {...rest} />;
}

export default memo(TrueGradient);
