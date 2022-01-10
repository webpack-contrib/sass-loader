import nodeSass from "node-sass";
import dartSass from "sass";
// eslint-disable-next-line import/no-namespace
import * as sassEmbedded from "sass-embedded";

import { isSupportedFibers } from "../src/utils";

import {
  compile,
  getCodeFromBundle,
  getCompiler,
  getErrors,
  getImplementationByName,
  getImplementationsAndAPI,
  getTestId,
  getWarnings,
} from "./helpers";

jest.setTimeout(30000);

let Fiber;
const implementations = [...getImplementationsAndAPI(), "sass_string"];

describe("implementation option", () => {
  beforeAll(async () => {
    if (isSupportedFibers()) {
      const { default: fibers } = await import("fibers");

      Fiber = fibers;
    }
  });

  beforeEach(() => {
    if (isSupportedFibers()) {
      // The `sass` (`Dart Sass`) package modify the `Function` prototype, but the `jest` lose a prototype
      Object.setPrototypeOf(Fiber, Function.prototype);
    }
  });

  implementations.forEach((item) => {
    let implementationName;
    let implementation;
    let api;

    if (typeof item === "string") {
      implementationName = item;
      implementation = getImplementationByName(implementationName);
      api = "old";
    } else {
      ({ name: implementationName, api, implementation } = item);
    }

    it(`'${implementationName}', '${api}' API`, async () => {
      const nodeSassSpy = jest.spyOn(nodeSass, "render");
      const dartSassSpy = jest.spyOn(dartSass, "render");
      const dartSassSpyModernAPI = jest.spyOn(dartSass, "compileStringAsync");
      const sassEmbeddedSpy = jest.spyOn(sassEmbedded, "render");
      const sassEmbeddedSpyModernAPI = jest.spyOn(
        sassEmbedded,
        "compileStringAsync"
      );

      const testId = getTestId("language", "scss");
      const options = { api, implementation };
      const compiler = getCompiler(testId, { loader: { options } });
      const stats = await compile(compiler);
      const { css, sourceMap } = getCodeFromBundle(stats, compiler);

      expect(css).toBeDefined();
      expect(sourceMap).toBeUndefined();

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");

      if (implementationName === "node-sass") {
        expect(nodeSassSpy).toHaveBeenCalledTimes(1);
        expect(dartSassSpy).toHaveBeenCalledTimes(0);
        expect(dartSassSpyModernAPI).toHaveBeenCalledTimes(0);
        expect(sassEmbeddedSpy).toHaveBeenCalledTimes(0);
        expect(sassEmbeddedSpyModernAPI).toHaveBeenCalledTimes(0);
      } else if (
        implementationName === "dart-sass" ||
        implementationName === "dart-sass_string"
      ) {
        if (api === "modern") {
          expect(nodeSassSpy).toHaveBeenCalledTimes(0);
          expect(dartSassSpy).toHaveBeenCalledTimes(0);
          expect(dartSassSpyModernAPI).toHaveBeenCalledTimes(1);
          expect(sassEmbeddedSpy).toHaveBeenCalledTimes(0);
          expect(sassEmbeddedSpyModernAPI).toHaveBeenCalledTimes(0);
        } else if (api === "old") {
          expect(nodeSassSpy).toHaveBeenCalledTimes(0);
          expect(dartSassSpy).toHaveBeenCalledTimes(1);
          expect(dartSassSpyModernAPI).toHaveBeenCalledTimes(0);
          expect(sassEmbeddedSpy).toHaveBeenCalledTimes(0);
          expect(sassEmbeddedSpyModernAPI).toHaveBeenCalledTimes(0);
        }
      } else if (implementationName === "sass-embedded") {
        if (api === "modern") {
          expect(nodeSassSpy).toHaveBeenCalledTimes(0);
          expect(dartSassSpy).toHaveBeenCalledTimes(0);
          expect(dartSassSpyModernAPI).toHaveBeenCalledTimes(0);
          expect(sassEmbeddedSpy).toHaveBeenCalledTimes(0);
          expect(sassEmbeddedSpyModernAPI).toHaveBeenCalledTimes(1);
        } else if (api === "old") {
          expect(nodeSassSpy).toHaveBeenCalledTimes(0);
          expect(dartSassSpy).toHaveBeenCalledTimes(0);
          expect(dartSassSpyModernAPI).toHaveBeenCalledTimes(0);
          expect(sassEmbeddedSpy).toHaveBeenCalledTimes(1);
          expect(sassEmbeddedSpyModernAPI).toHaveBeenCalledTimes(0);
        }
      }

      nodeSassSpy.mockRestore();
      dartSassSpy.mockRestore();
      dartSassSpyModernAPI.mockRestore();
      sassEmbeddedSpy.mockRestore();
      sassEmbeddedSpyModernAPI.mockRestore();
    });
  });

  it("should throw error when unresolved package", async () => {
    const testId = getTestId("language", "scss");
    const options = {
      implementation: "unresolved",
    };
    const compiler = getCompiler(testId, { loader: { options } });
    const stats = await compile(compiler);

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it("not specify", async () => {
    const nodeSassSpy = jest.spyOn(nodeSass, "render");
    const dartSassSpy = jest.spyOn(dartSass, "render");

    const testId = getTestId("language", "scss");
    const options = {};
    const compiler = getCompiler(testId, { loader: { options } });
    const stats = await compile(compiler);
    const { css, sourceMap } = getCodeFromBundle(stats, compiler);

    expect(css).toBeDefined();
    expect(sourceMap).toBeUndefined();

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");

    expect(nodeSassSpy).toHaveBeenCalledTimes(0);
    expect(dartSassSpy).toHaveBeenCalledTimes(1);

    nodeSassSpy.mockRestore();
    dartSassSpy.mockRestore();
  });

  it("not specify with old API", async () => {
    const nodeSassSpy = jest.spyOn(nodeSass, "render");
    const dartSassSpy = jest.spyOn(dartSass, "render");

    const testId = getTestId("language", "scss");
    const options = {
      api: "old",
    };
    const compiler = getCompiler(testId, { loader: { options } });
    const stats = await compile(compiler);
    const { css, sourceMap } = getCodeFromBundle(stats, compiler);

    expect(css).toBeDefined();
    expect(sourceMap).toBeUndefined();

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");

    expect(nodeSassSpy).toHaveBeenCalledTimes(0);
    expect(dartSassSpy).toHaveBeenCalledTimes(1);

    nodeSassSpy.mockRestore();
    dartSassSpy.mockRestore();
  });

  it("not specify with modern API", async () => {
    const nodeSassSpy = jest.spyOn(nodeSass, "render");
    const dartSassSpy = jest.spyOn(dartSass, "compileStringAsync");

    const testId = getTestId("language", "scss");
    const options = {
      api: "modern",
    };
    const compiler = getCompiler(testId, { loader: { options } });
    const stats = await compile(compiler);
    const { css, sourceMap } = getCodeFromBundle(stats, compiler);

    expect(css).toBeDefined();
    expect(sourceMap).toBeUndefined();

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");

    expect(nodeSassSpy).toHaveBeenCalledTimes(0);
    expect(dartSassSpy).toHaveBeenCalledTimes(1);

    nodeSassSpy.mockRestore();
    dartSassSpy.mockRestore();
  });

  it("should throw an error on an unknown sass implementation", async () => {
    const testId = getTestId("language", "scss");
    const options = {
      implementation: Object.assign({}, dartSass, {
        info: "strange-sass\t1.0.0",
      }),
    };

    const compiler = getCompiler(testId, { loader: { options } });
    const stats = await compile(compiler);

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should throw an error when the "info" is unparseable', async () => {
    const testId = getTestId("language", "scss");
    const options = {
      implementation: Object.assign({}, dartSass, { info: "asdfj" }),
    };

    const compiler = getCompiler(testId, { loader: { options } });
    const stats = await compile(compiler);

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should throw error when the "info" does not exist', async () => {
    const testId = getTestId("language", "scss");
    const options = {
      // eslint-disable-next-line no-undefined
      implementation: Object.assign({}, dartSass, { info: undefined }),
    };

    const compiler = getCompiler(testId, { loader: { options } });
    const stats = await compile(compiler);

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it("should not swallow an error when trying to load a sass implementation", async () => {
    jest.doMock("node-sass", () => {
      const error = new Error("Some error");

      error.code = "MODULE_NOT_FOUND";
      error.stack = null;

      throw error;
    });

    jest.doMock("sass", () => {
      const error = new Error("Some error");

      error.code = "MODULE_NOT_FOUND";
      error.stack = null;

      throw error;
    });

    const testId = getTestId("language", "scss");
    const options = {};

    const compiler = getCompiler(testId, { loader: { options } });
    const stats = await compile(compiler);

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });
});
