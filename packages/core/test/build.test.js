import { expect } from "chai";
import co from "../index.js";

function foo() {
  return {
    name: "plugin-foo",
    async build() {
      await new Promise((resolve) => {
        setTimeout(() => { resolve(); }, 2000);
      });
      return [{ fileName: "foo", contents: "built" }];
    }
  };
}

describe("build", () => {
  it("basic", () => {
    const config = co.loadConfig({ plugins: [foo()] });
    const results = co.build([], config);
    console.log(results);
  });
});
