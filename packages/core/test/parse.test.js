import { expect } from "chai";
import fs from "fs";
import co from "../pkg/cobalt_ui.js";

describe("tokens.yaml", () => {
  it("basic", () => {
    const yaml = fs.readFileSync("./test/fixtures/basic.yaml", "utf8");
    const { result, errors } = JSON.parse(co.parse(yaml));

    // no errors
    expect(errors, "errors found while parsing").to.have.lengthOf(0);

    // tokens parsed correctly
    expect(result.tokens, "error parsing tokens.yaml").to.deep.equal([
      { id: "color.blue", type: "color", value: "#218bff" },
      { id: "font.family", type: "font", value: ["IBM Plex Sans"] },
      { id: "space.s", type: "dimension", value: "4px" },
      { id: "easing.sine", type: "cubic-bezier", value: [0.5, 0, 0.5, 1] },
      { id: "icon.local", type: "file", value: "./icons/alert.svg" },
      { id: "icon.remote", type: "url", value: "https://my-cdn.com/github.svg" },
      { id: "gradient.linear", type: "linear-gradient", value: "to right top, #000000 15%, #00000000 92%" },
      { id: "gradient.radial", type: "radial-gradient", value: "ellipse at 75% 25%, #ff0000, #0000ff" },
      { id: "gradient.conic", type: "conic-gradient", value: "from -225deg at 50% 50%, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff" },
    ]);
  });

  it("modes", () => {
    const yaml = fs.readFileSync("./test/fixtures/modes.yaml", "utf8");
    const { result, errors } = JSON.parse(co.parse(yaml));

    // no errors
    expect(errors, "errors found while parsing").to.have.lengthOf(0);

    // tokens parsed correctly
    expect(result.tokens, "error parsing tokens.yaml").to.deep.equal([
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
    const yaml = fs.readFileSync("./test/fixtures/alias.yaml", "utf8");

    const { result, errors } = JSON.parse(co.parse(yaml));

    // no errors
    expect(errors, "errors found while parsing").to.have.lengthOf(0);

    // tokens parsed correctly
    expect(result.tokens, "error parsing tokens.yaml").to.deep.equal([
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

      const { errors } = JSON.parse(co.parse(yaml));
      expect(errors).to.deep.equal(["YAML parse error: mapping values are not allowed in this context at line 5 column 18"]);
    });

    it("unknown top-level property", () => {
      const yaml = `name: My Tokens
foo: bar
tokens:
  blue:
    type: color
    value: #0000ff`;

      const { errors } = JSON.parse(co.parse(yaml));
      expect(errors).to.deep.equal(['Invalid top-level name "foo". Place arbitrary data inside "metadata"']);
    });

    it("missing tokens", () => {
      const yaml = `name: My Tokens`;

      const { errors } = JSON.parse(co.parse(yaml));
      expect(errors).to.deep.equal(['"tokens" is empty!']);
    });

    it("missing value", () => {
      const yaml = `name: My Tokens
tokens:
  easing:
    sine:
      type: cubic-bezier`;

      const { errors } = JSON.parse(co.parse(yaml));
      expect(errors).to.deep.equal(["easing.sine: missing value"]);
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

      const { errors } = JSON.parse(co.parse(yaml));
      expect(errors).to.deep.equal(["font.size.text: can’t use font value for dimension"]);
    });

    it("alias missing", () => {
      const yaml = `name: My Tokens
tokens:
  color:
    green:
      type: color
      value: $fake`;

      const { errors } = JSON.parse(co.parse(yaml));
      expect(errors).to.deep.equal(["color.green: $fake not found"]);
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

      const { errors } = JSON.parse(co.parse(yaml));
      expect(errors).to.deep.equal(["a: can’t reference circular alias $b"]);
    });
  });
});
