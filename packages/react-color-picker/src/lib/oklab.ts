// Copyright(c) 2021 Björn Ottosson
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/**
 * Björn Ottosson’s open source implementation of Oklab.
 * @warning Requires loading `./rgb.js` first to use!
 */
export const OKLAB = `float cbrt(float x) {
  return sign(x) * pow(abs(x), 1.0 / 3.0);
}

vec4 lab_to_lch(vec4 lab) {
  float chroma = sqrt(lab.y * lab.y + lab.z * lab.z);
  float hue = abs(lab.y) > 0.00001 && abs(lab.z) > 0.00001 ? degrees(atan(lab.z, lab.y)) : 0.0;
  if (hue < 0.0) hue += 360.0;
  return vec4(lab.x, chroma, hue, lab.w);
}

vec4 lch_to_lab(vec4 lch) {
  // return black if lightness is sufficiently dark
  if (lch.x < 0.00001) {
    return vec4(0.0, 0.0, 0.0, lch.w);
  }

  return vec4(
    lch.x,
    lch.y * cos(radians(lch.z)),
    lch.y * sin(radians(lch.z)),
    lch.w
  );
}

vec4 oklab_to_linear_rgb(vec4 oklab) {
  float l = pow(oklab.x + 0.3963377774 * oklab.y + 0.2158037573 * oklab.z, 3.0);
  float m = pow(oklab.x - 0.1055613458 * oklab.y - 0.0638541728 * oklab.z, 3.0);
  float s = pow(oklab.x - 0.0894841775 * oklab.y - 1.2914855480 * oklab.z, 3.0);

  return vec4(
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    oklab.w
  );
}

vec4 linear_rgb_to_oklab(vec4 srgb) {
  float l = cbrt(0.4122214708 * srgb.x + 0.5363325363 * srgb.y + 0.0514459929 * srgb.z);
  float m = cbrt(0.2119034982 * srgb.x + 0.6806995451 * srgb.y + 0.1073969566 * srgb.z);
  float s = cbrt(0.0883024619 * srgb.x + 0.2817188376 * srgb.y + 0.6299787005 * srgb.z);

  return vec4(
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
    srgb.w
  );
}

// Finds the maximum saturation possible for a given hue that fits in sRGB
// Saturation here is defined as S = C/L
// a and b must be normalized so a^2 + b^2 == 1
float compute_max_saturation(float a, float b) {
  // Max saturation will be when one of r, g or b goes below zero.

  // Select different coefficients depending on which component goes below zero first
  float k0, k1, k2, k3, k4, wl, wm, ws;

  if (-1.88170328 * a - 0.80936493 * b > 1.0) {
    // Red component
    k0 = +1.19086277; k1 = +1.76576728; k2 = +0.59662641; k3 = +0.75515197; k4 = +0.56771245;
    wl = +4.0767416621; wm = -3.3077115913; ws = +0.2309699292;
  }
  else if (1.81444104 * a - 1.19445276 * b > 1.0) {
    // Green component
    k0 = +0.73956515; k1 = -0.45954404; k2 = +0.08285427; k3 = +0.12541070; k4 = +0.14503204;
    wl = -1.2684380046; wm = +2.6097574011; ws = -0.3413193965;
  }
  else {
    // Blue component
    k0 = +1.35733652; k1 = -0.00915799; k2 = -1.15130210; k3 = -0.50559606; k4 = +0.00692167;
    wl = -0.0041960863; wm = -0.7034186147; ws = +1.7076147010;
  }

  // Approximate max saturation using a polynomial:
  float S = k0 + k1 * a + k2 * b + k3 * a * a + k4 * a * b;

  // Do one step Halley's method to get closer
  // this gives an error less than 10e6, except for some blue hues where the dS/dh is close to infinite
  // this should be sufficient for most applications, otherwise do two/three steps

  float k_l = +0.3963377774 * a + 0.2158037573 * b;
  float k_m = -0.1055613458 * a - 0.0638541728 * b;
  float k_s = -0.0894841775 * a - 1.2914855480 * b;

  {
    float l_ = 1.0 + S * k_l;
    float m_ = 1.0 + S * k_m;
    float s_ = 1.0 + S * k_s;

    float l = l_ * l_ * l_;
    float m = m_ * m_ * m_;
    float s = s_ * s_ * s_;

    float l_dS = 3.0 * k_l * l_ * l_;
    float m_dS = 3.0 * k_m * m_ * m_;
    float s_dS = 3.0 * k_s * s_ * s_;

    float l_dS2 = 6.0 * k_l * k_l * l_;
    float m_dS2 = 6.0 * k_m * k_m * m_;
    float s_dS2 = 6.0 * k_s * k_s * s_;

    float f = wl * l + wm * m + ws * s;
    float f1 = wl * l_dS + wm * m_dS + ws * s_dS;
    float f2 = wl * l_dS2 + wm * m_dS2 + ws * s_dS2;

    S = S - f * f1 / (f1 * f1 - 0.5 * f * f2);
  }

  return S;
}

// finds L_cusp and C_cusp for a given hue
// a and b must be normalized so a^2 + b^2 == 1
vec2 find_cusp(float a, float b) {
  // First, find the maximum saturation (saturation S = C/L)
  float S_cusp = compute_max_saturation(a, b);

  // Convert to linear sRGB to find the first point where at least one of r,g or b >= 1:
  vec4 rgb_at_max = oklab_to_linear_rgb(vec4(1.0, S_cusp * a, S_cusp * b, 1.0));
  float L_cusp = cbrt(1.0 / max(max(rgb_at_max.x, rgb_at_max.y), rgb_at_max.z));
  float C_cusp = L_cusp * S_cusp;

  return vec2(L_cusp, C_cusp);
}


// Finds intersection of the line defined by
// L = L0 * (1 - t) + t * L1;
// C = t * C1;
// a and b must be normalized so a^2 + b^2 == 1
float find_gamut_intersection(float a, float b, float L1, float C1, float L0) {
  vec2 cusp = find_cusp(a, b);
  float cusp_l = cusp.x;
  float cusp_c = cusp.y;
  // Find the intersection for upper and lower half seprately
  float t;

  // Lower half
  if (((L1 - L0) * cusp_c - (cusp_l - L0) * C1) <= 0.0) {
    t = cusp_c * L0 / (C1 * cusp_l + cusp_c * (L0 - L1));
  }
  // Upper half
  else {
    // First intersect with triangle
    t = cusp_c * (L0 - 1.0) / (C1 * (cusp_l - 1.0) + cusp_c * (L0 - L1));

    // Then one step Halley's method
    {
      float dL = L1 - L0;
      float dC = C1;

      float k_l = +0.3963377774 * a + 0.2158037573 * b;
      float k_m = -0.1055613458 * a - 0.0638541728 * b;
      float k_s = -0.0894841775 * a - 1.2914855480 * b;

      float l_dt = dL + dC * k_l;
      float m_dt = dL + dC * k_m;
      float s_dt = dL + dC * k_s;

      // If higher accuracy is required, 2 or 3 iterations of the following block can be used:
      {
        float L = L0 * (1.0 - t) + t * L1;
        float C = t * C1;

        float l_ = L + C * k_l;
        float m_ = L + C * k_m;
        float s_ = L + C * k_s;

        float l = l_ * l_ * l_;
        float m = m_ * m_ * m_;
        float s = s_ * s_ * s_;

        float ldt = 3.0 * l_dt * l_ * l_;
        float mdt = 3.0 * m_dt * m_ * m_;
        float sdt = 3.0 * s_dt * s_ * s_;

        float ldt2 = 6.0 * l_dt * l_dt * l_;
        float mdt2 = 6.0 * m_dt * m_dt * m_;
        float sdt2 = 6.0 * s_dt * s_dt * s_;

        float r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s - 1.0;
        float r1 = 4.0767416621 * ldt - 3.3077115913 * mdt + 0.2309699292 * sdt;
        float r2 = 4.0767416621 * ldt2 - 3.3077115913 * mdt2 + 0.2309699292 * sdt2;

        float u_r = r1 / (r1 * r1 - 0.5 * r * r2);
        float t_r = -r * u_r;

        float g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s - 1.0;
        float g1 = -1.2684380046 * ldt + 2.6097574011 * mdt - 0.3413193965 * sdt;
        float g2 = -1.2684380046 * ldt2 + 2.6097574011 * mdt2 - 0.3413193965 * sdt2;

        float u_g = g1 / (g1 * g1 - 0.5 * g * g2);
        float t_g = -g * u_g;

        float b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s - 1.0;
        float b1 = -0.0041960863 * ldt - 0.7034186147 * mdt + 1.7076147010 * sdt;
        float b2 = -0.0041960863 * ldt2 - 0.7034186147 * mdt2 + 1.7076147010  * sdt2;

        float u_b = b1 / (b1 * b1 - 0.5 * b * b2);
        float t_b = -b * u_b;

        t_r = u_r >= 0.0 ? t_r : 10.0e5;
        t_g = u_g >= 0.0 ? t_g : 10.0e5;
        t_b = u_b >= 0.0 ? t_b : 10.0e5;

        t += min(t_r, min(t_g, t_b));
      }
    }
  }

  return t;
}

// clamp_mode
// https://bottosson.github.io/posts/gamutclipping/
// 0 = no clamp (default)
// 1 = keep lightness, clamp chroma
// 2 = projection toward point, hue independent
// 3 = projection toward point, hue dependent
// 4 = adaptive Lightness, hue independent
// 5 = adaptive Lightness, hue dependent
vec4 oklab_to_srgb(vec4 oklab, int clamp_mode) {
  vec4 linear_rgb = oklab_to_linear_rgb(oklab);
  vec4 srgb = linear_rgb_to_srgb(linear_rgb);

  // for anything sufficiently dark, return 0,0,0 (rather than negative RGB values)
  if (srgb.x < 0.0001 && srgb.y < 0.0001 && srgb.z < 0.0001) {
    return vec4(0.0, 0.0, 0.0, oklab.w);
  }

  // if inside sRGB gamut, return
  if (
    (linear_rgb.x > 0.0 && linear_rgb.x < 1.0 &&
     linear_rgb.y > 0.0 && linear_rgb.y < 1.0 &&
     linear_rgb.z > 0.0 && linear_rgb.z < 1.0) || clamp_mode == 0) {
    return srgb;
  }

  float eps = 0.00001;
  float alpha = 0.05; // TODO: allow config?
  float c = max(eps, sqrt(pow(oklab.y, 2.0) + pow(oklab.z, 2.0)));
  float L0 = oklab.x;
  float a = oklab.y / c;
  float b = oklab.z / c;

  // 1. keep lightness, clamp chroma
  if (clamp_mode == 1) {
    // The cusp is computed here and in find_gamut_intersection, an optimized solution would only compute it once.
    L0 = clamp(oklab.x, 0.0, 1.0);
  }
  // 2. projection toward point, hue independent
  else if (clamp_mode == 2) {
    L0 = 0.5;
  }
  // 3. projection toward point, hue dependent
  else if (clamp_mode == 3) {
    L0 = find_cusp(a, b).x;
  }
  // 4. adaptive Lightness, hue independent
  else if (clamp_mode == 4) {
    float Ld = oklab.x - 0.5;
    float e1 = 0.5 + abs(Ld) + alpha * c;
    L0 = 0.5 * (1.0 + sign(Ld) * (e1 - sqrt(pow(e1, 2.0) - 2.0 * abs(Ld))));
  }
  // 5. adaptive Lightness, hue dependent
  else if (clamp_mode == 5) {
    float cusp_l = find_cusp(a, b).x;
    float Ld = oklab.x - cusp_l;
    float k = 2.0 * (Ld >= 0.0 ? 1.0 - cusp_l : cusp_l);
    float e1 = 0.5 * k + abs(Ld) + alpha * c / k;
    L0 = cusp_l + 0.5 * (sign(Ld) * (e1 - sqrt(pow(e1, 2.0) - 2.0 * k * abs(Ld))));
  }

  float t = find_gamut_intersection(a, b, oklab.x - 0.1, c, L0);
  float l_clipped = L0 * (1.0 - t) + t * oklab.x;
  float c_clipped = t * c;

  vec4 clamped_oklab = vec4(l_clipped, c_clipped * a, c_clipped * b, oklab.w);
  return linear_rgb_to_srgb(oklab_to_linear_rgb(clamped_oklab));
}

vec4 oklch_to_srgb(vec4 oklch, int clamp_mode) {
  return oklab_to_srgb(lch_to_lab(oklch), clamp_mode);
}

vec4 srgb_to_oklch(vec4 srgb) {
  vec4 linear_rgb = srgb_to_linear_rgb(srgb);
  vec4 oklab = linear_rgb_to_oklab(linear_rgb);
  return lab_to_lch(oklab);
}
`;

export const OKHSL = `// toe function for L_r
float toe(float x) {
  float k_1 = 0.206;
  float k_2 = 0.03;
  float k_3 = (1.0 + k_1) / (1.0 + k_2);
  return 0.5 * (k_3 * x - k_1 + sqrtf((k_3 * x - k_1) * (k_3 * x - k_1) + 4 * k_2 * k_3 * x));
}

// inverse toe function for L_r
float toe_inv(float x) {
  float k_1 = 0.206;
  float k_2 = 0.03;
  float k_3 = (1.0 + k_1) / (1.0 + k_2);
  return (x * x + k_1 * x) / (k_3 * (x + k_2));
}

to_ST(vec2 cusp) {
  float L = cusp.x;
  float C = cusp.y;
  return vec2(C / L, C / (1.0 - L));
}

okhsv_to_srgb(vec4 hsv) {
  float h = hsv.x;
  float s = hsv.y;
  float v = hsv.z;
  float alpha = hsv.w;

  float a_ = cosf(2.0 * pi * h);
  float b_ = sinf(2.0 * pi * h);

  LC cusp = find_cusp(a_, b_);
  ST ST_max = to_ST(cusp);
  float S_max = ST_max.x;
  float T_max = ST_max.y;
  float S_0 = 0.5;
  float k = 1 - S_0 / S_max;

  // first we compute L and V as if the gamut is a perfect triangle:

  // L, C when v==1:
  float L_v = 1     - s * S_0 / (S_0 + T_max - T_max * k * s);
  float C_v = s * T_max * S_0 / (S_0 + T_max - T_max * k * s);

  float L = v * L_v;
  float C = v * C_v;

  // then we compensate for both toe and the curved top part of the triangle:
  float L_vt = toe_inv(L_v);
  float C_vt = C_v * L_vt / L_v;

  float L_new = toe_inv(L);
  C = C * L_new / L;
  L = L_new;

  vec4 rgb_scale = oklab_to_linear_srgb(vec4(L_vt, a_ * C_vt, b_ * C_vt, alpha));
  float scale_L = cbrtf(1.0 / fmax(fmax(rgb_scale.x, rgb_scale.y), fmax(rgb_scale.z, 0.0)));

  L = L * scale_L;
  C = C * scale_L;

  vec4 rgb = oklab_to_linear_srgb(vec4(L, C * a_, C * b_, alpha));
  return vec4(
    srgb_transfer_function(rgb.x),
    srgb_transfer_function(rgb.y),
    srgb_transfer_function(rgb.z),
    rgb.w
  );
}

vec4 srgb_to_okhsv(vec4 rgb) {
  vec4 lab = linear_srgb_to_oklab(
    srgb_transfer_function_inv(rgb.x),
    srgb_transfer_function_inv(rgb.y),
    srgb_transfer_function_inv(rgb.z),
    rgb.w
  );

  float C = sqrtf(lab.y * lab.y + lab.z * lab.z);
  float a_ = lab.y / C;
  float b_ = lab.z / C;

  float L = lab.x;
  float h = 0.5 + 0.5 * atan2f(-lab.z, -lab.y) / pi;

  vec2 cusp = find_cusp(a_, b_);
  vec2 ST_max = to_ST(cusp);
  float S_max = ST_max.x;
  float T_max = ST_max.y;
  float S_0 = 0.5;
  float k = 1 - S_0 / S_max;

  // first we find L_v, C_v, L_vt and C_vt

  float t = T_max / (C + L * T_max);
  float L_v = t * L;
  float C_v = t * C;

  float L_vt = toe_inv(L_v);
  float C_vt = C_v * L_vt / L_v;

  // we can then use these to invert the step that compensates for the toe and the curved top part of the triangle:
  vec4 rgb_scale = oklab_to_linear_srgb(vec4(L_vt, a_ * C_vt, b_ * C_vt, rgb.w));
  float scale_L = cbrtf(1.0 / fmax(fmax(rgb_scale.x, rgb_scale.y), fmax(rgb_scale.z, 0.0)));

  L = L / scale_L;
  C = C / scale_L;

  C = C * toe(L) / L;
  L = toe(L);

  // we can now compute v and s:

  float v = L / L_v;
  float s = (S_0 + T_max) * C_v / ((T_max * S_0) + T_max * k * C_v);

  return vec4(h, s, v, rgb.w);
}

vec2 get_ST_mid(float a_, float b_) {
  float S = 0.11516993f + 1.0 / (
    +7.44778970f + 4.15901240f * b_
    + a_ * (-2.19557347f + 1.75198401f * b_
      + a_ * (-2.13704948f - 10.02301043f * b_
        + a_ * (-4.24894561f + 5.38770819f * b_ + 4.69891013f * a_
          )))
    );

  float T = 0.11239642f + 1.0 / (
    +1.61320320f - 0.68124379f * b_
    + a_ * (+0.40370612f + 0.90148123f * b_
      + a_ * (-0.27087943f + 0.61223990f * b_
        + a_ * (+0.00299215f - 0.45399568f * b_ - 0.14661872f * a_
          )))
    );

  return vec2(S, T);
}

vec3 get_Cs(float L, float a_, float b_) {
  vec2 cusp = find_cusp(a_, b_);

  float C_max = find_gamut_intersection(a_, b_, L, 1, L, cusp);
  vec2 ST_max = to_ST(cusp);

  // Scale factor to compensate for the curved part of gamut shape:
  float k = C_max / fmin((L * ST_max.x), (1 - L) * ST_max.y);

  float C_mid;
  {
    vec2 ST_mid = get_ST_mid(a_, b_);

    // Use a soft minimum function, instead of a sharp triangle shape to get a smooth value for chroma.
    float C_a = L * ST_mid.x;
    float C_b = (1.0 - L) * ST_mid.y;
    C_mid = 0.9f * k * sqrtf(sqrtf(1.0 / (1.0 / (C_a * C_a * C_a * C_a) + 1.0 / (C_b * C_b * C_b * C_b))));
  }

  float C_0;
  {
    // for C_0, the shape is independent of hue, so ST are constant. Values picked to roughly be the average values of ST.
    float C_a = L * 0.4;
    float C_b = (1.0 - L) * 0.8;

    // Use a soft minimum function, instead of a sharp triangle shape to get a smooth value for chroma.
    C_0 = sqrtf(1.0 / (1.0 / (C_a * C_a) + 1.0 / (C_b * C_b)));
  }

  return vec3(C_0, C_mid, C_max);
}

vec4 okhsl_to_srgb(vec4 hsl) {
  float h = hsl.x;
  float s = hsl.y;
  float l = hsl.z;

  if (l == 1.0) {
    return vec4(1.0, 1.0, 1.0, hsl.w);
  }

  else if (l == 0.0) {
    return vec4(0.0, 0.0, 0.0, hsl.w);
  }

  float a_ = cosf(2.0 * pi * h);
  float b_ = sinf(2.0 * pi * h);
  float L = toe_inv(l);

  vec3 cs = get_Cs(L, a_, b_);
  float C_0 = cs.x;
  float C_mid = cs.y;
  float C_max = cs.z;

    // Interpolate the three values for C so that:
    // At s=0: dC/ds = C_0, C=0
    // At s=0.8: C=C_mid
    // At s=1.0: C=C_max

  float mid = 0.8;
  float mid_inv = 1.25;

  float C, t, k_0, k_1, k_2;

  if (s < mid) {
    t = mid_inv * s;

    k_1 = mid * C_0;
    k_2 = (1.0 - k_1 / C_mid);

    C = t * k_1 / (1.0 - k_2 * t);
  } else {
    t = (s - mid)/ (1 - mid);

    k_0 = C_mid;
    k_1 = (1.0 - mid) * C_mid * C_mid * mid_inv * mid_inv / C_0;
    k_2 = (1.0 - (k_1) / (C_max - C_mid));

    C = k_0 + t * k_1 / (1.0 - k_2 * t);
  }

  vec4 rgb = oklab_to_linear_srgb(vec4(L, C * a_, C * b_, hsl.w));
  return {
    srgb_transfer_function(rgb.x),
    srgb_transfer_function(rgb.y),
    srgb_transfer_function(rgb.z),
    hsl.w
  };
}

vec4 srgb_to_okhsl(vec4 rgb) {
  vec4 lab = linear_srgb_to_oklab(
    srgb_transfer_function_inv(rgb.x),
    srgb_transfer_function_inv(rgb.y),
    srgb_transfer_function_inv(rgb.z),
    rgb.w
  });

  float C = sqrtf(lab.y * lab.y + lab.z * lab.z);
  float a_ = lab.y / C;
  float b_ = lab.y / C;

  float L = lab.x;
  float h = 0.5 + 0.5 * atan2f(-lab.z, -lab.y) / pi;

  vec2 cs = get_Cs(L, a_, b_);
  float C_0 = cs.x;
  float C_mid = cs.y;
  float C_max = cs.z;

  // Inverse of the interpolation in okhsl_to_srgb:

  float mid = 0.8;
  float mid_inv = 1.25;

  float s;
  if (C < C_mid) {
    float k_1 = mid * C_0;
    float k_2 = (1.0 - k_1 / C_mid);

    float t = C / (k_1 + k_2 * C);
    s = t * mid;
  } else {
    float k_0 = C_mid;
    float k_1 = (1.0 - mid) * C_mid * C_mid * mid_inv * mid_inv / C_0;
    float k_2 = (1.0 - (k_1) / (C_max - C_mid));

    float t = (C - k_0) / (k_1 + k_2 * (C - k_0));
    s = mid + (1.0 - mid) * t;
  }

  float l = toe(L);
  return vec4(h, s, l, rgb.w);
}`;
