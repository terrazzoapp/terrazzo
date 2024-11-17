import type { Oklab } from '@terrazzo/use-color';
import { type ComponentProps, useEffect, useRef, useState } from 'react';
import { GradientOklab } from '../lib/webgl.js';

export interface TrueGradientProps extends ComponentProps<'canvas'> {
  start: Oklab;
  end: Oklab;
}

function TrueGradient({ start, end, ...props }: TrueGradientProps) {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const [webgl, setWebgl] = useState<GradientOklab | undefined>();

  // initialize
  useEffect(() => {
    if (webgl || !canvasEl.current) {
      return;
    }
    setWebgl(new GradientOklab({ canvas: canvasEl.current, startColor: start, endColor: end }));
  }, [webgl]);

  // update color
  useEffect(() => {
    if (webgl) {
      webgl.setColors(start, end);
    }
  }, [start, end, webgl]);

  return <canvas {...props} ref={canvasEl} />;
}

export default TrueGradient;
