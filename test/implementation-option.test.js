import nodeSass from "node-sass";
import dartSass from "sass";
// eslint-disable-next-line import/no-namespace
import * as sassEmbedded from "sass-embedded";

import {
  close,
  compile,
  getCodeFromBundle,
  getCompiler,
  getErrors,
  getImplementationByName,
  getImplementationsAndAPI,
  getTestId,
  getWarnings,
  isNodeSassSupported,
} from "./helpers";

jest.setTimeout(30000);

const implementations = [...getImplementationsAndAPI(), "sass_string"];

/** Helper to create spy functions for the modern Compiler API */
const spyOnCompiler = (implementation) => {
  const actualFn = implementation.initAsyncCompiler.bind(implementation);

  const initSpy = jest
    .spyOn(implementation, "initAsyncCompiler")
    .mockImplementation(async () => {
      const compiler = await actualFn();
      // eslint-disable-next-line no-use-before-define
      spies.compileStringSpy = jest.spyOn(compiler, "compileStringAsync");
      return compiler;
    });

  const spies = {
    initSpy,
    mockClear() {
      if (this.compileStringSpy) {
        this.compileStringSpy.mockClear();
      }
    },
    mockRestore() {
      initSpy.mockRestore();
      delete this.compileStringSpy;
    },
  };

  return spies;
};

describe("implementation option", () => {
  const nodeSassSpy = jest.spyOn(nodeSass, "render");
  const dartSassSpy = jest.spyOn(dartSass, "render");
  const dartSassSpyModernAPI = jest.spyOn(dartSass, "compileStringAsync");
  const dartSassCompilerSpies = spyOnCompiler(dartSass);
  const sassEmbeddedSpy = jest.spyOn(sassEmbedded, "render");
  const sassEmbeddedSpyModernAPI = jest.spyOn(
    sassEmbedded,
    "compileStringAsync",
  );
  const sassEmbeddedCompilerSpies = spyOnCompiler(sassEmbedded);

  implementations.forEach((item) => {
    let implementationName;
    let implementation;
    let api;

    if (typeof item === "string") {
      implementationName = item;
      implementation = getImplementationByName(implementationName);
      api = "legacy";
    } else {
      ({ name: implementationName, api, implementation } = item);
    }

    it(`'${implementationName}', '${api}' API`, async () => {
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
        } else if (api === "modern-compiler") {
          expect(nodeSassSpy).toHaveBeenCalledTimes(0);
          expect(dartSassSpy).toHaveBeenCalledTimes(0);
          expect(dartSassSpyModernAPI).toHaveBeenCalledTimes(0);
          expect(dartSassCompilerSpies.compileStringSpy).toHaveBeenCalledTimes(
            1,
          );
          expect(sassEmbeddedSpy).toHaveBeenCalledTimes(0);
          expect(sassEmbeddedSpyModernAPI).toHaveBeenCalledTimes(0);
        } else if (api === "legacy") {
          if (isNodeSassSupported()) {
            expect(nodeSassSpy).toHaveBeenCalledTimes(0);
          }
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
        } else if (api === "modern-compiler") {
          expect(nodeSassSpy).toHaveBeenCalledTimes(0);
          expect(dartSassSpy).toHaveBeenCalledTimes(0);
          expect(dartSassSpyModernAPI).toHaveBeenCalledTimes(0);
          expect(sassEmbeddedSpy).toHaveBeenCalledTimes(0);
          expect(sassEmbeddedSpyModernAPI).toHaveBeenCalledTimes(0);
          expect(
            sassEmbeddedCompilerSpies.compileStringSpy,
          ).toHaveBeenCalledTimes(1);
        } else if (api === "legacy") {
          expect(nodeSassSpy).toHaveBeenCalledTimes(0);
          expect(dartSassSpy).toHaveBeenCalledTimes(0);
          expect(dartSassSpyModernAPI).toHaveBeenCalledTimes(0);
          expect(sassEmbeddedSpy).toHaveBeenCalledTimes(1);
          expect(sassEmbeddedSpyModernAPI).toHaveBeenCalledTimes(0);
        }
      }

      nodeSassSpy.mockClear();
      dartSassSpy.mockClear();
      dartSassSpyModernAPI.mockClear();
      dartSassCompilerSpies.mockClear();
      sassEmbeddedSpy.mockClear();
      sassEmbeddedSpyModernAPI.mockClear();
      sassEmbeddedCompilerSpies.mockClear();

      await close(compiler);
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

    await close(compiler);
  });

  it("not specify", async () => {
    const testId = getTestId("language", "scss");
    const options = {};
    const compiler = getCompiler(testId, { loader: { options } });
    const stats = await compile(compiler);
    const { css, sourceMap } = getCodeFromBundle(stats, compiler);

    expect(css).toBeDefined();
    expect(sourceMap).toBeUndefined();

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");

    expect(sassEmbeddedSpy).toHaveBeenCalledTimes(1);
    expect(nodeSassSpy).toHaveBeenCalledTimes(0);
    expect(dartSassSpy).toHaveBeenCalledTimes(0);

    sassEmbeddedSpy.mockClear();
    nodeSassSpy.mockClear();
    dartSassSpy.mockClear();

    await close(compiler);
  });

  it("not specify with legacy API", async () => {
    const testId = getTestId("language", "scss");
    const options = {
      api: "legacy",
    };
    const compiler = getCompiler(testId, { loader: { options } });
    const stats = await compile(compiler);
    const { css, sourceMap } = getCodeFromBundle(stats, compiler);

    expect(css).toBeDefined();
    expect(sourceMap).toBeUndefined();

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");

    expect(sassEmbeddedSpy).toHaveBeenCalledTimes(1);
    expect(nodeSassSpy).toHaveBeenCalledTimes(0);
    expect(dartSassSpy).toHaveBeenCalledTimes(0);

    sassEmbeddedSpy.mockClear();
    nodeSassSpy.mockClear();
    dartSassSpy.mockClear();

    await close(compiler);
  });

  it("not specify with modern API", async () => {
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

    expect(sassEmbeddedSpyModernAPI).toHaveBeenCalledTimes(1);
    expect(nodeSassSpy).toHaveBeenCalledTimes(0);
    expect(dartSassSpyModernAPI).toHaveBeenCalledTimes(0);

    sassEmbeddedSpyModernAPI.mockClear();
    nodeSassSpy.mockClear();
    dartSassSpyModernAPI.mockClear();

    await close(compiler);
  });

  it("not specify with modern-compiler API", async () => {
    const testId = getTestId("language", "scss");
    const options = {
      api: "modern-compiler",
    };
    const compiler = getCompiler(testId, { loader: { options } });
    const stats = await compile(compiler);
    const { css, sourceMap } = getCodeFromBundle(stats, compiler);

    expect(css).toBeDefined();
    expect(sourceMap).toBeUndefined();

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");

    expect(sassEmbeddedCompilerSpies.compileStringSpy).toHaveBeenCalledTimes(1);
    expect(sassEmbeddedSpyModernAPI).toHaveBeenCalledTimes(0);
    expect(nodeSassSpy).toHaveBeenCalledTimes(0);
    expect(dartSassSpyModernAPI).toHaveBeenCalledTimes(0);
    expect(dartSassCompilerSpies.compileStringSpy).toHaveBeenCalledTimes(0);

    nodeSassSpy.mockClear();
    dartSassSpyModernAPI.mockClear();
    dartSassCompilerSpies.mockClear();

    await close(compiler);
  });

  it.each(["sass-embedded", "dart-sass"])(
    "should support switching the implementation within the same process when using the modern-compiler API",
    async (implementationName) => {
      const testId = getTestId("language", "scss");
      const options = {
        api: "modern-compiler",
        implementation: getImplementationByName(implementationName),
      };
      const compiler = getCompiler(testId, { loader: { options } });
      const stats = await compile(compiler);
      const { css, sourceMap } = getCodeFromBundle(stats, compiler);

      expect(css).toBeDefined();
      expect(sourceMap).toBeUndefined();

      expect(getWarnings(stats)).toMatchSnapshot("warnings");
      expect(getErrors(stats)).toMatchSnapshot("errors");

      expect(dartSassCompilerSpies.compileStringSpy).toHaveBeenCalledTimes(
        implementationName === "dart-sass" ? 1 : 0,
      );
      expect(sassEmbeddedCompilerSpies.compileStringSpy).toHaveBeenCalledTimes(
        implementationName === "sass-embedded" ? 1 : 0,
      );

      dartSassCompilerSpies.mockClear();
      sassEmbeddedCompilerSpies.mockClear();

      await close(compiler);
    },
  );

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

    await close(compiler);
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

    await close(compiler);
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

    await close(compiler);
  });

  it("should try to load using valid order", async () => {
    jest.doMock("sass", () => {
      const error = new Error("Some error sass");

      error.code = "MODULE_NOT_FOUND";
      error.stack = null;

      throw error;
    });

    jest.doMock("node-sass", () => {
      const error = new Error("Some error node-sass");

      error.code = "MODULE_NOT_FOUND";
      error.stack = null;

      throw error;
    });

    jest.doMock("sass-embedded", () => {
      const error = new Error("Some error sass-embedded");

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

    await close(compiler);
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

    await close(compiler);
  });
});
