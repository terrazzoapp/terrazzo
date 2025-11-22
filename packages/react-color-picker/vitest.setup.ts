import { afterEach, expect, vi } from 'vitest';

// RTL
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

// @see https://github.com/vitest-dev/vitest/issues/1430
afterEach(cleanup);

// vitest-axe
import * as matchers from 'vitest-axe/matchers';

expect.extend(matchers);

// WebGL mock
class WebGL2RenderingContext {
  attachShader = vi.fn();
  canvas = document.createElement('canvas');
  beginQuery = vi.fn();
  drawingBufferColorSpace = 'srgb';
  beginTransformFeedback = vi.fn();
  bindBuffer = vi.fn();
  bindBufferBase = vi.fn();
  bindBufferRange = vi.fn();
  bindSampler = vi.fn();
  bindTransformFeedback = vi.fn();
  bindVertexArray = vi.fn();
  blitFramebuffer = vi.fn();
  bufferData = vi.fn();
  bufferSubData = vi.fn();
  clearBufferfi = vi.fn();
  clearBufferfv = vi.fn();
  clearBufferiv = vi.fn();
  clearBufferuiv = vi.fn();
  clientWaitSync = vi.fn(() => 100);
  compileShader = vi.fn();
  compressedTexSubImage3D = vi.fn();
  copyBufferSubData = vi.fn();
  copyTexSubImage3D = vi.fn();
  createBuffer = vi.fn(() => new Buffer('', 'utf8'));
  createQuery = vi.fn();
  createProgram = vi.fn(() => ({}));
  createShader = vi.fn(() => 100);
  createTransformFeedback = vi.fn();
  createVertexArray = vi.fn(() => ({}));
  deleteQuery = vi.fn();
  deleteSampler = vi.fn();
  deleteSync = vi.fn();
  deleteTransformFeedback = vi.fn();
  deleteVertexArray = vi.fn();
  drawArraysInstanced = vi.fn();
  drawArrays = vi.fn();
  drawBuffers = vi.fn();
  disable = vi.fn();
  enable = vi.fn();
  enableVertexAttribArray = vi.fn();
  getAttribLocation = vi.fn(() => 100);
  getProgramInfoLog = vi.fn(() => 'PROGRAM_INFO_LOG');
  getProgramParameter = vi.fn(() => 'PROGRAM_PARAMETER');
  getShaderInfoLog = vi.fn(() => 'SHADER_INFO');
  getShaderParameter = vi.fn(() => 'SHADER_PARAMETER');
  hint = vi.fn();
  isBuffer = vi.fn();
  isEnabled = vi.fn(() => false);
  isFramebuffer = vi.fn(() => false);
  isProgram = vi.fn(() => false);
  isRenderbuffer = vi.fn(() => false);
  isShader = vi.fn(() => false);
  isTexture = vi.fn(() => false);
  lineWidth = vi.fn();
  linkProgram = vi.fn();
  shaderSource = vi.fn();
  uniform1f = vi.fn();
  uniform1i = vi.fn();
  uniform1iv = vi.fn();
  uniform1v = vi.fn();
  uniform2f = vi.fn();
  uniform2i = vi.fn();
  uniform2iv = vi.fn();
  uniform2v = vi.fn();
  uniform3f = vi.fn();
  uniform3i = vi.fn();
  uniform3iv = vi.fn();
  uniform3v = vi.fn();
  uniform4f = vi.fn();
  uniform4i = vi.fn();
  uniform4iv = vi.fn();
  uniform4v = vi.fn();
  uniformMatrix2fv = vi.fn();
  uniformMatrix3fv = vi.fn();
  uniformMatrix4fv = vi.fn();
  useProgram = vi.fn();
  validateProgram = vi.fn(() => true);
  vertexAttrib1f = vi.fn();
  vertexAttrib1v = vi.fn();
  vertexAttrib2f = vi.fn();
  vertexAttrib2v = vi.fn();
  vertexAttrib3f = vi.fn();
  vertexAttrib3v = vi.fn();
  vertexAttrib4f = vi.fn();
  vertexAttrib4v = vi.fn();
  vertexAttribPointer = vi.fn();
  viewport = vi.fn();
}

HTMLCanvasElement.prototype.getContext = () => new WebGL2RenderingContext();

class OffscreenCanvas {
  height = 0;
  width = 0;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

window.OffscreenCanvas = OffscreenCanvas;

// ResizeObserver
class ResizeObserver {
  disconnect = vi.fn();
  observe = vi.fn();
  unobserve = vi.fn();
}

window.ResizeObserver = ResizeObserver;
