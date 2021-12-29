import { expect } from "chai";
import fs from "fs";
import co from "../index.js";

describe("tokens.yaml", () => {
  it("basic", () => {
    let schema = {};
    const yaml = fs.readFileSync("./test/fixtures/basic.yaml", "utf8");

    // no errors
    expect(() => {
      schema = co.parse(yaml);
    }, "errors found while parsing").not.to.throw();

    // tokens parsed correctly
    expect(schema.tokens, "error parsing tokens.yaml").to.deep.equal([
      { id: "color.blue", type: "color", value: "#218bff" },
      { id: "font.family", type: "font", value: ["IBM Plex Sans"] },
      { id: "space.s", type: "dimension", value: "4px" },
      { id: "easing.sine", type: "cubic-bezier", value: [0.5, 0, 0.5, 1] },
      { id: "icon.local", type: "file", value: "./icons/alert.svg" },
      { id: "icon.remote", type: "url", value: "https://my-cdn.com/github.svg" },
      { id: "shadow.near", type: "shadow", value: ["0 2px #00000040"] },
      { id: "shadow.far", type: "shadow", value: ["0 1px 1px #0000000c", "0 2px 2px #0000000c", "0 4px 4px #0000000c", "0 8px 8px #0000000c"] },
      { id: "gradient.linear", type: "linear-gradient", value: "to right top, #000000 15%, #00000000 92%" },
      { id: "gradient.radial", type: "radial-gradient", value: "ellipse at 75% 25%, #ff0000, #0000ff" },
      { id: "gradient.conic", type: "conic-gradient", value: "from -225deg at 50% 50%, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff" },
    ]);
  });

  it("modes", () => {
    let schema = {};
    const yaml = fs.readFileSync("./test/fixtures/modes.yaml", "utf8");

    // no errors
    expect(() => {
      schema = co.parse(yaml);
    }, "errors found while parsing").not.to.throw();

    // tokens parsed correctly
    expect(schema.tokens, "error parsing tokens.yaml").to.deep.equal([
      {
        id: "color.blue",
        mode: {
          dark: "#388bfd",
          dark_colorblind: "#388bfd",
          dark_dimmed: "#4184e4",
          dark_high_contrast: "#409eff",
          light: "#218bff",
          light_colorblind: "#218bff",
          light_high_contrast: "#1168e3",
        },
        type: "color",
        value: "#218bff",
      },
    ]);
  });

  it("alias", () => {
    let schema = {};
    const yaml = fs.readFileSync("./test/fixtures/alias.yaml", "utf8");

    // no errors
    expect(() => {
      schema = co.parse(yaml);
    }, "errors found while parsing").not.to.throw();

    // tokens parsed correctly
    expect(schema.tokens, "error parsing tokens.yaml").to.deep.equal([
      { id: "color.blue", type: "color", value: "#218bff" },
      { id: "color.active", type: "color", value: "$color.blue" },
      { id: "color.highlight", type: "color", value: "$color.active" },
      { id: "color.brand", type: "color", value: "$color.blue" },
      { id: "font.family.base", type: "font", value: ["Helvetica"] },
      { id: "font.family.button", type: "font", value: "$font.family.base" },
      { id: "size.m", type: "dimension", value: "1rem" },
      { id: "size.margin_m", type: "dimension", value: "$size.m" },
    ]);
  });

  describe("errors", () => {
    it("invalid YAML", () => {
      const yaml = `name: Invalid YAML
tokens:
  color:
    blue:
      type: color:
      value: #0000ff`;

      expect(() => {
        co.parse(yaml);
      }).to.throw("  ✘  YAML parse error: mapping values are not allowed in this context at line 5 column 18");
    });

    it("unknown top-level property", () => {
      const yaml = `name: My Tokens
foo: bar
tokens:
  blue:
    type: color
    value: #0000ff`;

      expect(() => {
        co.parse(yaml);
      }).to.throw('  ✘  Invalid top-level name "foo". Place arbitrary data inside "metadata"');
    });

    it("missing tokens", () => {
      const yaml = "name: My Tokens";

      expect(() => {
        co.parse(yaml);
      }).to.throw('  ✘  "tokens" is empty!');
    });

    it("missing value", () => {
      const yaml = `name: My Tokens
tokens:
  easing:
    sine:
      type: cubic-bezier`;

      expect(() => {
        co.parse(yaml);
      }).to.throw("  ✘  easing.sine: bad or missing value");
    });

    it("bad value", () => {
      const yaml = `name: My Tokens
tokens:
  font:
    family:
      base:
        type: font
        value:
          helvetica: true`;

      expect(() => {
        co.parse(yaml);
      }).to.throw("  ✘  font.family.base: bad or missing value");
    });

    it("alias mismatch", () => {
      const yaml = `name: My Tokens
tokens:
  font:
    family:
      text:
        type: font
        value: Helvetica
    size:
      text:
        type: dimension
        value: $font.family.text`;

      expect(() => {
        co.parse(yaml);
      }).to.throw("  ✘  font.size.text: can’t use font value for dimension");
    });

    it("alias missing", () => {
      const yaml = `name: My Tokens
tokens:
  color:
    green:
      type: color
      value: $fake`;

      expect(() => {
        co.parse(yaml);
      }).to.throw("  ✘  color.green: $fake not found");
    });

    it("circular alias", () => {
      const yaml = `name: My Tokens
tokens:
  a:
    type: dimension
    value: $b
  b:
    type: dimension
    value: $c
  c:
    type: dimension
    value: $a`;

      expect(() => {
        co.parse(yaml);
      }).to.throw("  ✘  a: can’t reference circular alias $b");
    });

    it("missing modes", () => {
      const yaml = `name: My Tokens
tokens:
  font:
    size:
      modes:
        - desktop
        - mobile
      text:
        type: font
        value: 16px
        mode:
          desktop: 16px`;

      expect(() => {
        co.parse(yaml);
      }).to.throw('  ✘  font.size.text: missing mode "mobile"');
    });
  });
});
