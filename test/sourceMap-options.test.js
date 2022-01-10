import fs from "fs";
import path from "path";
import url from "url";

import { isSupportedFibers } from "../src/utils";

import {
  compile,
  getCodeFromBundle,
  getCompiler,
  getErrors,
  getImplementationsAndAPI,
  getTestId,
  getWarnings,
} from "./helpers";

let Fiber;
const implementations = getImplementationsAndAPI();
const syntaxStyles = ["scss", "sass"];

describe("sourceMap option", () => {
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
    syntaxStyles.forEach((syntax) => {
      const { name: implementationName, api, implementation } = item;

      it(`should generate source maps when value is not specified and the "devtool" option has "source-map" value ('${implementationName}', '${api}' API, '${syntax}' syntax)`, async () => {
        expect.assertions(10);

        const testId = getTestId("language", syntax);
        const options = { implementation, api };
        const compiler = getCompiler(testId, {
          devtool: "source-map",
          loader: { options },
        });
        const stats = await compile(compiler);
        const { css, sourceMap } = getCodeFromBundle(stats, compiler);

        sourceMap.sourceRoot = "";
        sourceMap.sources = sourceMap.sources.map((source) => {
          expect(path.isAbsolute(source)).toBe(true);
          expect(source).toBe(path.normalize(source));
          expect(
            fs.existsSync(path.resolve(sourceMap.sourceRoot, source))
          ).toBe(true);

          return path
            .relative(path.resolve(__dirname, ".."), source)
            .replace(/\\/g, "/");
        });

        expect(css).toMatchSnapshot("css");
        expect(sourceMap).toMatchSnapshot("source map");
        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });

      it(`should generate source maps when value has "true" value and the "devtool" option has "source-map" value ('${implementationName}', '${api}' API, '${syntax}' syntax)`, async () => {
        expect.assertions(10);

        const testId = getTestId("language", syntax);
        const options = { implementation, api, sourceMap: true };
        const compiler = getCompiler(testId, {
          devtool: "source-map",
          loader: { options },
        });
        const stats = await compile(compiler);
        const { css, sourceMap } = getCodeFromBundle(stats, compiler);

        sourceMap.sourceRoot = "";
        sourceMap.sources = sourceMap.sources.map((source) => {
          expect(path.isAbsolute(source)).toBe(true);
          expect(source).toBe(path.normalize(source));
          expect(
            fs.existsSync(path.resolve(sourceMap.sourceRoot, source))
          ).toBe(true);

          return path
            .relative(path.resolve(__dirname, ".."), source)
            .replace(/\\/g, "/");
        });

        expect(css).toMatchSnapshot("css");
        expect(sourceMap).toMatchSnapshot("source map");
        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });

      it(`should generate source maps when value has "true" value and the "devtool" option has "false" value ('${implementationName}', '${api}' API, '${syntax}' syntax)`, async () => {
        expect.assertions(10);

        const testId = getTestId("language", syntax);
        const options = { implementation, api, sourceMap: true };
        const compiler = getCompiler(testId, {
          devtool: false,
          loader: { options },
        });
        const stats = await compile(compiler);
        const { css, sourceMap } = getCodeFromBundle(stats, compiler);

        sourceMap.sourceRoot = "";
        sourceMap.sources = sourceMap.sources.map((source) => {
          expect(path.isAbsolute(source)).toBe(true);
          expect(source).toBe(path.normalize(source));
          expect(
            fs.existsSync(path.resolve(sourceMap.sourceRoot, source))
          ).toBe(true);

          return path
            .relative(path.resolve(__dirname, ".."), source)
            .replace(/\\/g, "/");
        });

        expect(css).toMatchSnapshot("css");
        expect(sourceMap).toMatchSnapshot("source map");
        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });

      it(`should generate source maps when value has "false" value, but the "sassOptions.sourceMap" has the "true" value ('${implementationName}', '${api}' API, '${syntax}' syntax)`, async () => {
        expect.assertions(api === "modern" ? 10 : 8);

        const testId = getTestId("language", syntax);
        const options = {
          implementation,
          api,
          sourceMap: false,
          sassOptions:
            api === "modern"
              ? {
                  sourceMap: true,
                }
              : {
                  sourceMap: true,
                  outFile: path.join(__dirname, "style.css.map"),
                  sourceMapContents: true,
                  omitSourceMapUrl: true,
                  sourceMapEmbed: false,
                },
        };
        const compiler = getCompiler(testId, {
          devtool: false,
          loader: { options },
        });
        const stats = await compile(compiler);
        const { css, sourceMap } = getCodeFromBundle(stats, compiler);

        sourceMap.sourceRoot = "";
        sourceMap.sources = sourceMap.sources.map((source) => {
          let normalizedSource = source;

          if (api === "modern") {
            normalizedSource = url.fileURLToPath(normalizedSource);

            expect(source).toMatch(/^file:/);
            expect(path.isAbsolute(normalizedSource)).toBe(true);
          } else {
            expect(path.isAbsolute(source)).toBe(false);
          }

          expect(
            fs.existsSync(
              path.resolve(__dirname, path.normalize(normalizedSource))
            )
          ).toBe(true);

          return path
            .relative(path.resolve(__dirname, ".."), normalizedSource)
            .replace(/\\/g, "/");
        });

        expect(css).toMatchSnapshot("css");
        expect(sourceMap).toMatchSnapshot("source map");
        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });

      it(`should not generate source maps when value is not specified and the "devtool" option has "false" value ('${implementationName}', '${api}' API, '${syntax}' syntax)`, async () => {
        const testId = getTestId("language", syntax);
        const options = { implementation, api };
        const compiler = getCompiler(testId, {
          devtool: false,
          loader: { options },
        });
        const stats = await compile(compiler);
        const { css, sourceMap } = getCodeFromBundle(stats, compiler);

        expect(css).toMatchSnapshot("css");
        expect(sourceMap).toMatchSnapshot("source map");
        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });

      it(`should not generate source maps when value has "false" value and the "devtool" option has "source-map" value ('${implementationName}', '${api}' API, '${syntax}' syntax)`, async () => {
        const testId = getTestId("language", syntax);
        const options = { implementation, api, sourceMap: false };
        const compiler = getCompiler(testId, {
          devtool: "source-map",
          loader: { options },
        });
        const stats = await compile(compiler);
        const { css, sourceMap } = getCodeFromBundle(stats, compiler);

        expect(css).toMatchSnapshot("css");
        expect(sourceMap).toMatchSnapshot("source map");
        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });

      it(`should not generate source maps when value has "false" value and the "devtool" option has "false" value ('${implementationName}', '${api}' API, '${syntax}' syntax)`, async () => {
        const testId = getTestId("language", syntax);
        const options = { implementation, api, sourceMap: false };
        const compiler = getCompiler(testId, {
          devtool: false,
          loader: { options },
        });
        const stats = await compile(compiler);
        const { css, sourceMap } = getCodeFromBundle(stats, compiler);

        expect(css).toMatchSnapshot("css");
        expect(sourceMap).toMatchSnapshot("source map");
        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });
    });
  });
});
