/** Generic implementation of the sRGB transfer function */
export const LINEAR_RGB = `float srgb_transfer_fn(float a) {
  float v = abs(a);
  return v <= 0.0031308 ? 12.92 * v : 1.055 * pow(v, (1.0 / 2.4)) - 0.055;
}

float srgb_inverse_transfer_fn(float a) {
  float v = abs(a);
  return v <= 0.04045 ? v / 12.92 : pow((v + 0.055) / 1.055, 2.4);
}

vec4 srgb_to_linear_rgb(vec4 srgb) {
  return vec4(srgb_inverse_transfer_fn(srgb.x), srgb_inverse_transfer_fn(srgb.y), srgb_inverse_transfer_fn(srgb.z), srgb.w);
}

vec4 linear_rgb_to_srgb(vec4 linear_rgb) {
  return vec4(srgb_transfer_fn(linear_rgb.x), srgb_transfer_fn(linear_rgb.y), srgb_transfer_fn(linear_rgb.z), linear_rgb.w);
}

vec4 avg_vec4(vec4 a, vec4 b, float w) {
  return a * (1.0 - w) + b * w;
}

vec4 blend_srgb(vec4 a, vec4 b, float w) {
  vec4 lrgb_a = srgb_to_linear_rgb(a);
  vec4 lrgb_b = srgb_to_linear_rgb(b);
  vec4 blended = linear_rgb_to_srgb(avg_vec4(a, b, w));
  blended.w = 1.0;
  return blended;
}
`;
