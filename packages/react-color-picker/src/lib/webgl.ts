import type { A98, Lrgb, P3, Prophoto, Rec2020, Rgb } from '@terrazzo/use-color';
import { OKLAB } from './oklab.js';
import { LINEAR_RGB } from './rgb.js';

/** RGB-based colorspaces */
export type WebGLColor = A98 | Lrgb | Rgb | P3 | Rec2020 | Prophoto;

/** create a WebGL2 rendering context and throw errors if needed */
export function createRenderingContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  // init GL
  const gl = canvas.getContext('webgl2');
  if (!gl) {
    throw new Error('Could not get WebGL context');
  }
  const canvasRect = canvas.getBoundingClientRect();
  canvas.width = canvasRect.width;
  canvas.height = canvasRect.height;
  gl.viewport(0, 0, canvasRect.width, canvasRect.height);

  return gl;
}

export interface CreateProgramOptions {
  gl: WebGL2RenderingContext;
  vShaderSrc: string;
  fShaderSrc: string;
}

/** create a WebGL program from vertex shader & fragment shader sources */
export function createProgram({ gl, vShaderSrc, fShaderSrc }: CreateProgramOptions): WebGLProgram {
  // vertex shader
  const vShader = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vShader, vShaderSrc);
  gl.compileShader(vShader);
  if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
    throw new Error(`VECTOR SHADER: ${gl.getShaderInfoLog(vShader) || 'unknown'}`);
  }

  // fragment shader
  const fShader = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fShader, fShaderSrc);
  gl.compileShader(fShader);
  if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
    throw new Error(`FRAGMENT SHADER: ${gl.getShaderInfoLog(fShader) || 'unknown'}`);
  }

  // build program
  const program = gl.createProgram()!;
  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program)!);
  }
  gl.useProgram(program);
  return program;
}

// TODO: currently uses incorrect transfer function for Rec2020 (but OK for now since web doesn’t support Rec2020 :P)
/**
 * Create a pixel-perfect gradient blend in Oklab space using WebGL
 */
export const GRADIENT_RGB_SHADERS = {
  attrs: {
    a_position: 'a_position',
    a_resolution: 'a_resolution',
    a_start_color: 'a_start_color',
    a_end_color: 'a_end_color',
  },
  vShader: '',
  fShader: '',
};
GRADIENT_RGB_SHADERS.vShader = `#version 300 es

in vec4 ${GRADIENT_RGB_SHADERS.attrs.a_position};
in vec2 ${GRADIENT_RGB_SHADERS.attrs.a_resolution};
in vec4 ${GRADIENT_RGB_SHADERS.attrs.a_start_color};
in vec4 ${GRADIENT_RGB_SHADERS.attrs.a_end_color};
out vec4 v_start_color;
out vec4 v_end_color;
out vec2 v_resolution;

void main() {
  gl_Position = ${GRADIENT_RGB_SHADERS.attrs.a_position};
  v_resolution = ${GRADIENT_RGB_SHADERS.attrs.a_resolution};
  v_start_color = ${GRADIENT_RGB_SHADERS.attrs.a_start_color};
  v_end_color = ${GRADIENT_RGB_SHADERS.attrs.a_end_color};
}
`;
GRADIENT_RGB_SHADERS.fShader = `#version 300 es
precision highp float;

in vec2 v_resolution;
in vec4 v_start_color;
in vec4 v_end_color;
out vec4 f_color;

${LINEAR_RGB}

void main() {
  float a = vec2(gl_FragCoord.xy / v_resolution).x;
  f_color = blend_srgb(v_start_color, v_end_color, a);
}
`;

export class GradientRGB {
  gl: WebGL2RenderingContext;
  startColor: WebGLColor;
  endColor: WebGLColor;
  program: WebGLProgram;
  attr: Record<keyof typeof GRADIENT_RGB_SHADERS.attrs, number> = {
    a_position: -1,
    a_resolution: -1,
    a_start_color: -1,
    a_end_color: -1,
  };
  ro: ResizeObserver;

  private lastFrame: number | undefined;

  constructor({
    canvas,
    startColor,
    endColor,
  }: { canvas: HTMLCanvasElement; startColor: WebGLColor; endColor: WebGLColor }) {
    this.gl = createRenderingContext(canvas);
    this.program = createProgram({
      gl: this.gl,
      vShaderSrc: GRADIENT_RGB_SHADERS.vShader,
      fShaderSrc: GRADIENT_RGB_SHADERS.fShader,
    });

    // get attribute locations
    this.attr.a_position = this.gl.getAttribLocation(this.program, GRADIENT_RGB_SHADERS.attrs.a_position);
    this.attr.a_resolution = this.gl.getAttribLocation(this.program, GRADIENT_RGB_SHADERS.attrs.a_resolution);
    this.attr.a_start_color = this.gl.getAttribLocation(this.program, GRADIENT_RGB_SHADERS.attrs.a_start_color);
    this.attr.a_end_color = this.gl.getAttribLocation(this.program, GRADIENT_RGB_SHADERS.attrs.a_end_color);
    this.gl.enableVertexAttribArray(this.attr.a_position);

    // keep canvas size up-to-date
    this.ro = new ResizeObserver((entries) => {
      this.setSize(entries[0]!.contentRect);
    });
    if (!(this.gl.canvas instanceof OffscreenCanvas)) {
      this.ro.observe(this.gl.canvas);
    }

    // init attribs & first paint
    this.startColor = startColor;
    this.endColor = endColor;
    this.setColors(startColor, endColor);
    this.gl.vertexAttrib2f(this.attr.a_resolution, this.gl.canvas.width, this.gl.canvas.height);
    this.render();
  }

  setColors(startColor: WebGLColor, endColor: WebGLColor) {
    this.startColor = startColor;
    this.endColor = endColor;
    // note: `drawingBufferColorSpace` is ignored in Firefox, but it shouldn’t throw an error
    if (
      endColor.mode === 'a98' ||
      endColor.mode === 'p3' ||
      endColor.mode === 'rec2020' ||
      endColor.mode === 'prophoto' ||
      startColor.mode === 'a98' ||
      startColor.mode === 'p3' ||
      startColor.mode === 'rec2020' ||
      startColor.mode === 'prophoto'
    ) {
      this.gl.drawingBufferColorSpace = 'display-p3';
    } else {
      this.gl.drawingBufferColorSpace = 'srgb';
    }
    this.gl.vertexAttrib4f(this.attr.a_start_color, startColor.r, startColor.g, startColor.b, 1);
    this.gl.vertexAttrib4f(this.attr.a_end_color, endColor.r, endColor.g, endColor.b, 1);
    this.render();
  }

  setSize(rect: DOMRect) {
    this.gl.vertexAttrib2f(this.attr.a_resolution, rect.width, rect.height);
    this.gl.canvas.width = rect.width;
    this.gl.canvas.height = rect.height;
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.render();
  }

  /** render the canvas */
  render() {
    if (this.lastFrame) {
      cancelAnimationFrame(this.lastFrame);
    }
    this.lastFrame = requestAnimationFrame(() => {
      const positionBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
      this.gl.vertexAttribPointer(this.attr.a_position, 2, this.gl.FLOAT, false, 0, 0);
      // biome-ignore format: this is formatted
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
        -1,-1,    1,-1,    -1, 1, // first triangle
        -1, 1,    1,-1,     1, 1, // second triangle
      ]), this.gl.STATIC_DRAW);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

      this.lastFrame = undefined;
    });
  }
}

/**
 * Generate a perfect rainbow hue wheel in Oklab colorspace with WebGL
 */
export const HUE_SHADERS = {
  attrs: { a_position: 'a_position', a_resolution: 'a_resolution' },
  vShader: '',
  fShader: '',
};
HUE_SHADERS.vShader = `#version 300 es
precision highp float;

in vec4 ${HUE_SHADERS.attrs.a_position};
in vec2 ${HUE_SHADERS.attrs.a_resolution};
out vec2 v_resolution;

void main() {
  gl_Position = ${HUE_SHADERS.attrs.a_position};
  v_resolution = ${HUE_SHADERS.attrs.a_resolution};
}`;
HUE_SHADERS.fShader = `#version 300 es
precision highp float;

in vec2 v_resolution;
out vec4 f_color;

${LINEAR_RGB}

${OKLAB}

void main() {
  // clamp_mode
  // https://bottosson.github.io/posts/gamutclipping/
  // 0 = no clamp (default)
  // 1 = keep lightness, clamp chroma
  // 2 = projection toward point, hue independent
  // 3 = projection toward point, hue dependent
  // 4 = adaptive Lightness, hue independent
  // 5 = adaptive Lightness, hue dependent
  int clamp_mode = 2;

  float hue_norm = vec2(gl_FragCoord.xy / v_resolution).x;
  float hue = 360.0 * hue_norm;

  f_color = oklch_to_srgb(vec4(0.8, 0.4, hue, 1.0), clamp_mode);
}
`;

export class HueWheel {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  gamut: 'srgb' | 'p3' = 'srgb';
  attr: Record<keyof typeof HUE_SHADERS.attrs, number> = { a_position: -1, a_resolution: -1 };
  ro: ResizeObserver;

  private lastFrame: number | undefined;

  constructor({ canvas, gamut = 'srgb' }: { canvas: HTMLCanvasElement; gamut?: 'srgb' | 'p3' }) {
    this.gl = createRenderingContext(canvas);
    this.program = createProgram({ gl: this.gl, vShaderSrc: HUE_SHADERS.vShader, fShaderSrc: HUE_SHADERS.fShader });

    // get attribute locations
    this.attr.a_position = this.gl.getAttribLocation(this.program, HUE_SHADERS.attrs.a_position);
    this.attr.a_resolution = this.gl.getAttribLocation(this.program, HUE_SHADERS.attrs.a_resolution);
    this.gl.enableVertexAttribArray(this.attr.a_position);

    // keep canvas size up-to-date
    this.ro = new ResizeObserver((entries) => {
      this.setSize(entries[0]!.contentRect);
    });
    if (!(this.gl.canvas instanceof OffscreenCanvas)) {
      this.ro.observe(this.gl.canvas);
    }

    // init attribs & first paint
    this.setGamut(gamut);
    this.gl.vertexAttrib2f(this.attr.a_resolution, this.gl.canvas.width, this.gl.canvas.height);
    this.render();
  }

  setGamut(gamut: 'srgb' | 'p3') {
    if (gamut !== 'srgb' && gamut !== 'p3') {
      throw new Error(`Unsupported gamut: "${gamut}"`);
    }
    // this.gl.drawingBufferColorSpace = gamut === 'p3' ? 'display-p3' : 'srgb';
    this.gl.drawingBufferColorSpace = 'display-p3';
  }

  setSize(rect: DOMRect) {
    this.gl.vertexAttrib2f(this.attr.a_resolution, rect.width, rect.height);
    this.gl.canvas.width = rect.width;
    this.gl.canvas.height = rect.height;
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.render();
  }

  /** render the canvas */
  render() {
    if (this.lastFrame) {
      cancelAnimationFrame(this.lastFrame);
    }
    this.lastFrame = requestAnimationFrame(() => {
      const positionBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
      this.gl.vertexAttribPointer(this.attr.a_position, 2, this.gl.FLOAT, false, 0, 0);
      // biome-ignore format: this is formatted
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
        -1,-1,    1,-1,    -1, 1, // first triangle
        -1, 1,    1,-1,     1, 1, // second triangle
      ]), this.gl.STATIC_DRAW);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

      this.lastFrame = undefined;
    });
  }
}
