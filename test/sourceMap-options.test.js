import fs from "fs";
import path from "path";

import nodeSass from "node-sass";
import dartSass from "sass";

import { isSupportedFibers } from "../src/utils";

import {
  compile,
  getCodeFromBundle,
  getCompiler,
  getErrors,
  getImplementationByName,
  getTestId,
  getWarnings,
  readAsset,
} from "./helpers";

let Fiber;
const implementations = [nodeSass, dartSass];
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

  implementations.forEach((implementation) => {
    syntaxStyles.forEach((syntax) => {
      const [implementationName] = implementation.info.split("\t");

      it(`should generate source maps when value is not specified and the "devtool" option has "source-map" value (${implementationName}) (${syntax})`, async () => {
        expect.assertions(10);

        const testId = getTestId("language", syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
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

      it(`should generate source maps when value has "true" value and the "devtool" option has "source-map" value (${implementationName}) (${syntax})`, async () => {
        expect.assertions(10);

        const testId = getTestId("language", syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sourceMap: true,
        };
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

      it(`should generate source maps when value has "true" value and the "devtool" option has "false" value (${implementationName}) (${syntax})`, async () => {
        expect.assertions(10);

        const testId = getTestId("language", syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sourceMap: true,
        };
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

      it(`should generate source maps when value has "false" value, but the "sassOptions.sourceMap" has the "true" value (${implementationName}) (${syntax})`, async () => {
        expect.assertions(8);

        const testId = getTestId("language", syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sourceMap: false,
          sassOptions: {
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
          expect(path.isAbsolute(source)).toBe(false);
          expect(
            fs.existsSync(path.resolve(__dirname, path.normalize(source)))
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

      it(`should not generate source maps when value is not specified and the "devtool" option has "false" value (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId("language", syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
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

      it(`should not generate source maps when value has "false" value and the "devtool" option has "source-map" value (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId("language", syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sourceMap: false,
        };
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

      it(`should not generate source maps when value has "false" value and the "devtool" option has "false" value (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId("language", syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sourceMap: false,
        };
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

      it(`should generate and emit source maps when value has "external" value (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId("language", syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sourceMap: "external",
          sassOptions: {
            outFile: "style.css",
          },
        };
        const compiler = getCompiler(testId, {
          rules: [
            {
              test: /\.s[ac]ss$/i,
              type: "asset/resource",
              generator: {
                filename: "[name].css",
              },
              use: [
                {
                  loader: path.join(__dirname, "../src/cjs.js"),
                  options,
                },
              ],
            },
          ],
        });
        const stats = await compile(compiler);

        const css = readAsset("language.css", compiler, stats);
        const sourceMap = JSON.parse(
          readAsset("style.css.map", compiler, stats)
        );

        sourceMap.sources = sourceMap.sources.map((source) => {
          expect(source).toBe(path.normalize(source));

          return path
            .relative(path.resolve(__dirname, ".."), source)
            .replace(/\\/g, "/");
        });

        expect(css).toMatchSnapshot("css");
        expect(sourceMap).toMatchSnapshot("source map");
        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });

      it(`should generate and emit source maps when value has "external" value and nested outFile (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId("language", syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sourceMap: "external",
          sassOptions: {
            outFile: "assets/[name].css",
            omitSourceMapUrl: false,
            sourceMapEmbed: false,
            sourceMapContents: false,
          },
        };
        const compiler = getCompiler(testId, {
          rules: [
            {
              test: /\.s[ac]ss$/i,
              type: "asset/resource",
              generator: {
                filename: "assets/[name].css",
              },
              use: [
                {
                  loader: path.join(__dirname, "../src/cjs.js"),
                  options,
                },
              ],
            },
          ],
        });
        const stats = await compile(compiler);

        const css = readAsset("assets/language.css", compiler, stats);
        const sourceMap = JSON.parse(
          readAsset("assets/language.css.map", compiler, stats)
        );

        sourceMap.sources = sourceMap.sources.map((source) => {
          expect(source).toBe(path.normalize(source));

          return path
            .relative(path.resolve(__dirname, ".."), source)
            .replace(/\\/g, "/");
        });

        expect(css).toMatchSnapshot("css");
        expect(sourceMap).toMatchSnapshot("source map");
        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });

      it(`should generate and emit source maps when value has "external" value and "sassOptions.omitSourceMapUrl" has "true" value (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId("language", syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sourceMap: "external",
          sassOptions: {
            omitSourceMapUrl: true,
          },
        };
        const compiler = getCompiler(testId, {
          rules: [
            {
              test: /\.s[ac]ss$/i,
              type: "asset/resource",
              generator: {
                filename: "[name].css",
              },
              use: [
                {
                  loader: path.join(__dirname, "../src/cjs.js"),
                  options,
                },
              ],
            },
          ],
        });
        const stats = await compile(compiler);

        const css = readAsset("language.css", compiler, stats);
        const sourceMap = JSON.parse(
          readAsset("language.css.map", compiler, stats)
        );

        sourceMap.sources = sourceMap.sources.map((source) => {
          expect(source).toBe(path.normalize(source));

          return path
            .relative(path.resolve(__dirname, ".."), source)
            .replace(/\\/g, "/");
        });

        expect(css).toMatchSnapshot("css");
        expect(sourceMap).toMatchSnapshot("source map");
        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });

      it(`should generate embeded source maps when value has "external" value, but the "sassOptions.sourceMapEmbed" has the "true" value (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId("language", syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sourceMap: "external",
          sassOptions: {
            sourceMapEmbed: true,
          },
        };
        const compiler = getCompiler(testId, {
          rules: [
            {
              test: /\.s[ac]ss$/i,
              type: "asset/resource",
              generator: {
                filename: "[name].css",
              },
              use: [
                {
                  loader: path.join(__dirname, "../src/cjs.js"),
                  options,
                },
              ],
            },
          ],
        });
        const stats = await compile(compiler);
        const { compilation } = stats;

        const css = readAsset("language.css", compiler, stats);

        expect(css).toMatchSnapshot("css");
        expect(compilation.getAsset(`language.css.map`)).toBeUndefined();
        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });
    });
  });
});
