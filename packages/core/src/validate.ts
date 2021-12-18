import type { RawColorToken, RawConicGradientToken, RawCubicBezierToken, RawDimensionToken, RawFileToken, RawFontToken, RawLinearGradientToken, RawRadialGradientToken, RawShadowToken, RawTokenSchema, RawURLToken, TokenType } from "./parse";

import color from "better-color-tools";
import * as colors from "kleur/colors";

const VALID_TOP_LEVEL = new Set<keyof RawTokenSchema>(["name", "version", "metadata", "tokens"]);
const PxRE = /^\d+px$/;
const RemRE = /^\d+rem$/;
const HexRE = /^#[A-Za-z0-9]{3,8}$/;
const DegRE = /^\d+deg$/;
const CornerRE = /^(to\s+)?(top|right|bottom|left)(\s+(top|right|bottom|left))?$/;
const StopRE = /^#[A-Za-z0-9]{3,8}(\s+\d+%)?(\s+\s+%)?$/;

export class Validator {
  private errors: string[] = [];
  private warnings: string[] = [];

  public async validate(schema: RawTokenSchema): Promise<{ errors: string[] | undefined; warnings: string[] | undefined }> {
    this.errors = [];
    this.warnings = [];

    if (!schema.tokens) {
      this.errors.push(`top level "tokens" property required`);
    }

    for (const k of Object.keys(schema)) {
      if (!VALID_TOP_LEVEL.has(k as keyof RawTokenSchema)) {
        this.errors.push(`${colors.bold("root")}: unknown key "${k}" (arbitrary information must be placed under "metadata")`);
      }
    }

    for (const [k, v] of Object.entries(schema.tokens)) {
      if (k.includes(".")) this.errors.push(`invalid name "${k}". Names cannot contain the "." character.`);
      this.validateToken(v, k);
    }

    return {
      errors: this.errors.length ? this.errors.map((msg) => `${colors.red("✘  error  ")}  ${msg}`) : undefined,
      warnings: this.warnings.length ? this.warnings.map((msg) => `${colors.yellow("!  warning")}  ${msg}`) : undefined,
    };
  }

  private validateGroup(group: any, id: string, chain: string[] = [], requiredModes?: string[]): void {
    if (typeof group !== "object") return;
    chain.push(id);

    // group.tokens ?
    const entries = Object.entries(group.tokens);
    // group.tokens not empty ?
    if (entries.length) {
      for (const [k, v] of entries) {
        // handle modes
        if (k == "modes") {
          if (Array.isArray(group.modes) && group.modes.every((val: any) => typeof val === "string")) {
            requiredModes = group.modes;
          } else {
            this.errors.push(`Group "${id}" modes must be an array of strings`);
          }
          continue;
        }
        // handle tokens
        this.validateToken(v, k, requiredModes);
      }
    }
    // group.tokens empty (error)
    else this.errors.push(`Group "${id}" has no tokens`);
  }

  private validateToken(token: any, id: string, requiredModes?: string[]): void {
    if (id.includes(".")) this.errors.push(`invalid name "${id}". Names cannot contain the "." character.`);
    switch (token.type as TokenType | string | undefined) {
      case "color":
        this.validateColor(token, id, requiredModes);
        break;
      case "dimension":
        this.validateDimension(token, id, requiredModes);
        break;
      case "font":
        this.validateFont(token, id, requiredModes);
        break;
      case "cubic-bezier":
        this.validateCubicBezier(token, id, requiredModes);
        break;
      case "file":
        this.validateFile(token, id, requiredModes);
        break;
      case "url":
        this.validateURL(token, id, requiredModes);
        break;
      case "shadow":
        this.validateShadow(token, id, requiredModes);
        break;
      case "linear-gradient":
        this.validateLinearGradient(token, id, requiredModes);
        break;
      case "radial-gradient":
        this.validateRadialGradient(token, id, requiredModes);
        break;
      case "conic-gradient":
        this.validateConicGradient(token, id, requiredModes);
        break;
      default: {
        if (Array.isArray(token.type)) {
          this.errors.push(`Unexpected array found on "type" for "${id}"`);
          break;
        }
        // group
        if (typeof token.type === "object") {
          this.validateGroup(token, id);
          break;
        }
        // custom type
        if (typeof token.type !== "string") {
          this.errors.push(`Custom token "${id}" missing a "type"`);
          break;
        }
        break;
      }
    }
  }

  private validateColor(token: RawColorToken, id: string, requiredModes?: string[]): void {
    if (typeof token.value === "string") {
      if (!HexRE.test(token.value.trim())) {
        this.errors.push(`Color "${id}" needs hex color, received "${token.value}"`);
      }
    } else if (typeof token.value === "number") {
      if (!HexRE.test(color.from(token.value).hex)) {
        this.errors.push(`Color "${id}" needs hex color, received "${token.value}"`);
      }
    } else if (token.value === undefined) {
      this.errors.push(`Color "${id}" missing value`);
    } else {
      this.errors.push(`Color "${id}" needs hex color, received "${token.value}"`);
    }
    if (token.hasOwnProperty("mode")) {
      this.validateModes(token.mode as any, id, requiredModes);
    }
  }

  private validateDimension(token: RawDimensionToken, id: string, requiredModes?: string[]): void {
    if (token.value === undefined) {
      this.errors.push(`Dimenson "${id}" missing value`);
    } else if (typeof token.value != "string" || (!PxRE.test(token.value.trim()) && !RemRE.test(token.value.trim()))) {
      this.errors.push(`Dimension "${id}" must be a px or rem measurement, received "${typeof token.value}`);
    }
    if (token.hasOwnProperty("mode")) {
      this.validateModes(token.mode as any, id, requiredModes);
    }
  }

  private validateCubicBezier(token: RawCubicBezierToken, id: string, requiredModes?: string[]): void {
    if (token.value === undefined) {
      this.errors.push(`Cubic bézier "${id}" missing value`);
    } else if (!Array.isArray(token.value) || token.value.length != 4 || !token.value.every((d) => typeof d == "number" && !Number.isNaN(d))) {
      this.errors.push(`Cubic bézier "${id}" expected [x1, x2, y1, y2] format, received "${typeof token.value}"`);
    } else {
      const [x1, , x2] = token.value;
      if (x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) this.errors.push(`Cubic bézier "${id}" must have x values between 0 and 1 (inclusive)`);
    }
    if (token.hasOwnProperty("mode")) {
      this.validateModes(token.mode as any, id, requiredModes);
    }
  }

  private validateFont(token: RawFontToken, id: string, requiredModes?: string[]): void {
    if (token.value === undefined) {
      this.errors.push(`Font "${id}" missing value`);
    } else if (token.value == "string" || Array.isArray(token.value)) {
      if (Array.isArray(token.value) && !token.value.every((f) => typeof f == "string")) this.errors.push(`Font "${id}" array must contain only strings`);
      // valid
    } else {
      this.errors.push(`Font "${id}" value must be a string or array of strings, received "${typeof token.value}`);
    }
    if (token.hasOwnProperty("mode")) {
      this.validateModes(token.mode as any, id, requiredModes);
    }
  }

  private validateFile(token: RawFileToken, id: string, requiredModes?: string[]): void {
    if (token.value === undefined) {
      this.errors.push(`File "${id}" missing value`);
    } else if (token.value != "string") {
      this.errors.push(`File "${id}" expected string, received "${token.value}"`);
    }
    if (token.hasOwnProperty("mode")) {
      this.validateModes(token.mode as any, id, requiredModes);
    }
  }

  private validateURL(token: RawURLToken, id: string, requiredModes?: string[]): void {
    if (token.value === undefined) {
      this.errors.push(`URL "${id}" missing value`);
    } else if (token.value != "string") {
      this.errors.push(`URL "${id}" expected string, received "${token.value}"`);
    } else {
      try {
        new URL(token.value);
      } catch {
        this.errors.push(`URL "${id}" expected URL, received "${token.value}" (if this is a file, use "type": "file" instead)`);
      }
    }
    if (token.hasOwnProperty("mode")) {
      this.validateModes(token.mode as any, id, requiredModes);

      if (typeof token.mode == "object") {
        for (const [k, v] of Object.entries(token.mode)) {
          try {
            new URL(v);
          } catch {
            this.errors.push(`URL "${id}.mode.${k}" has invalid URL ${v}`);
          }
        }
      }
    }
  }

  private validateShadow(token: RawShadowToken, id: string, requiredModes?: string[]): void {
    if (token.value === undefined || (Array.isArray(token.value) && !token.value.length)) {
      this.errors.push(`Shadow "${id}" missing value`);
    } else if (Array.isArray(token.value)) {
      for (const s of token.value) {
        if (s.position != undefined && typeof s.position != "string") this.errors.push(`Shadow "${id}" position expected string, received "${s.position}"`);
        if (s.size != undefined && typeof s.size != "string" && s.size != 0) this.errors.push(`Shadow "${id}" size expected dimension, received "${s.position}"`);
        if (s.spread != undefined && typeof s.spread != "string" && s.spread != 0) this.errors.push(`Shadow "${id}" spread expected dimension, received "${s.position}"`);
        if (s.color != undefined && (typeof s.color != "string" || !HexRE.test(s.color))) this.errors.push(`Shadow "${id}" color expected hex, received "${s.color}"`);
      }
    }
    if (token.hasOwnProperty("mode")) {
      this.validateModes(token.mode as any, id, requiredModes);
      if (typeof token.mode == "object") {
        // recursively validate mode items
        for (const k of Object.keys(token.mode)) {
          this.validateShadow({ value: token.mode[k] } as any, `${id}.mode.${k}`);
        }
      }
    }
  }

  private validateLinearGradient(token: RawLinearGradientToken, id: string, requiredModes?: string[]): void {
    if (token.value == undefined) {
      this.errors.push(`Linear gradient "${id}" missing value`);
    } else if (typeof token.value != "object" || Array.isArray(token.value)) {
      this.errors.push(`Linear gradient "${id}" value expected object, received "${Array.isArray(token.value) ? "array" : typeof token.value}"`);
    } else {
      if (token.value.angle != undefined && !DegRE.test(token.value.angle) && !CornerRE.test(token.value.angle)) this.errors.push(`Linear gradient "${id}" angle expected degrees or corner, received "${token.value.angle}"`);
      if (!token.value.stops || !Array.isArray(token.value.stops)) {
        this.errors.push(`Linear gradient "${id}" stops expected array of strings, received "${typeof token.value.stops}"`);
      } else {
        token.value.stops.forEach((stop, n) => {
          if (!StopRE.test(stop)) this.errors.push(`Linear gradient "${id}" stop ${n + 1} invalid format, received "${stop}"`);
        });
      }
    }
    if (token.hasOwnProperty("mode")) {
      this.validateModes(token.mode as any, id, requiredModes);
    }
  }

  private validateRadialGradient(token: RawRadialGradientToken, id: string, requiredModes?: string[]): void {
    if (token.value == undefined) {
      this.errors.push(`Radial gradient "${id}" missing value`);
    } else if (typeof token.value != "object" || Array.isArray(token.value)) {
      this.errors.push(`Radial gradient "${id}" value expected object, received "${Array.isArray(token.value) ? "array" : typeof token.value}"`);
    } else {
      if (token.value.shape != undefined && token.value.shape != "circle" && token.value.shape != "ellipse") this.errors.push(`Radial gradient "${id}" shape must be "circle" or "ellipse"`);
      if (token.value.position != undefined && token.value.position != "string") this.errors.push(`Radial gradient "${id}" position expected string, received "${token.value.position}"`);
      if (!token.value.stops || !Array.isArray(token.value.stops)) {
        this.errors.push(`Radial gradient "${id}" stops expected array of strings, received "${typeof token.value.stops}"`);
      } else {
        token.value.stops.forEach((stop, n) => {
          if (!StopRE.test(stop)) this.errors.push(`Radial gradient "${id}" stop ${n + 1} invalid format, received "${stop}"`);
        });
      }
    }
    if (token.hasOwnProperty("mode")) {
      this.validateModes(token.mode as any, id, requiredModes);
    }
  }

  private validateConicGradient(token: RawConicGradientToken, id: string, requiredModes?: string[]): void {
    if (token.value == undefined) {
      this.errors.push(`Conic gradient "${id}" missing value`);
    } else if (typeof token.value != "object" || Array.isArray(token.value)) {
      this.errors.push(`Conic gradient "${id}" value expected object, received "${Array.isArray(token.value) ? "array" : typeof token.value}"`);
    } else {
      if (token.value.angle != undefined && !DegRE.test(token.value.angle) && !CornerRE.test(token.value.angle)) this.errors.push(`Conic gradient "${id}" angle expected degrees or corner, received "${token.value.angle}"`);
      if (token.value.position != undefined && token.value.position != "string") this.errors.push(`Conic gradient "${id}" position expected string, received "${token.value.position}"`);
      if (!token.value.stops || !Array.isArray(token.value.stops)) {
        this.errors.push(`Conic gradient "${id}" stops expected array of strings, received "${typeof token.value.stops}"`);
      } else {
        token.value.stops.forEach((stop, n) => {
          if (!StopRE.test(stop)) this.errors.push(`Conic gradient "${id}" stop ${n + 1} invalid format, received "${stop}"`);
        });
      }
    }
    if (token.hasOwnProperty("mode")) {
      this.validateModes(token.mode as any, id, requiredModes);
    }
  }

  private validateModes(mode: Record<string, any>, id: string, requiredModes?: string[]): void {
    if (typeof mode != "object" || Array.isArray(mode)) {
      this.errors.push(`Expected mode to be a key: value object on ${id}, received "${Array.isArray(mode) ? "array" : typeof mode}"`);
    }
    if (!requiredModes || !requiredModes.length) return;
    for (const k in Object.keys(mode)) {
      if (!mode.hasOwnProperty(k)) {
        this.errors.push(`Mode "${k} missing on ${id}"`);
      }
    }
  }
}
