const src = require("../src");
const cjs = require("../src/cjs");

describe("cjs", () => {
  it("should exported", () => {
    expect(cjs).toEqual(src);
  });
});
