import url from "url";

import { isSupportedFibers } from "../src/utils";

import {
  compile,
  getCodeFromBundle,
  getCodeFromSass,
  getCompiler,
  getErrors,
  getImplementationsAndAPI,
  getTestId,
  getWarnings,
} from "./helpers";

jest.setTimeout(60000);

let Fiber;
const implementations = getImplementationsAndAPI();
const syntaxStyles = ["scss", "sass"];

describe("loader", () => {
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
    const { name: implementationName, api, implementation } = item;

    syntaxStyles.forEach((syntax) => {
      it(`should not emit warning by default ('${implementationName}', '${api}' API, '${syntax}' syntax)`, async () => {
        const testId = getTestId("logging", syntax);
        const options = {
          implementation,
          api,
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);
        const logs = [];

        for (const [name, value] of stats.compilation.logging) {
          if (/sass-loader/.test(name)) {
            logs.push(
              value.map((i) => {
                return {
                  type: i.type,
                  args: i.args.map((arg) =>
                    arg
                      .replace(url.pathToFileURL(__dirname), "file:///<cwd>")
                      .replace(/\\/g, "/")
                  ),
                };
              })
            );
          }
        }

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot("css");
        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
        expect(logs).toMatchSnapshot("logs");
      });

      it(`should not emit warning when 'false' used ('${implementationName}', '${api}' API, '${syntax}' syntax)`, async () => {
        const testId = getTestId("logging", syntax);
        const options = {
          implementation,
          api,
          warnRuleAsWarning: false,
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);
        const logs = [];

        for (const [name, value] of stats.compilation.logging) {
          if (/sass-loader/.test(name)) {
            logs.push(
              value.map((i) => {
                return {
                  type: i.type,
                  args: i.args.map((arg) =>
                    arg
                      .replace(url.pathToFileURL(__dirname), "file:///<cwd>")
                      .replace(/\\/g, "/")
                  ),
                };
              })
            );
          }
        }

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot("css");
        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
        expect(logs).toMatchSnapshot("logs");
      });

      it(`should not emit warning when 'true' used ('${implementationName}', '${api}' API, '${syntax}' syntax)`, async () => {
        const testId = getTestId("logging", syntax);
        const options = {
          implementation,
          api,
          warnRuleAsWarning: true,
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);
        const logs = [];

        for (const [name, value] of stats.compilation.logging) {
          if (/sass-loader/.test(name)) {
            logs.push(
              value.map((i) => {
                return {
                  type: i.type,
                  args: i.args.map((arg) =>
                    arg
                      .replace(url.pathToFileURL(__dirname), "file:///<cwd>")
                      .replace(/\\/g, "/")
                  ),
                };
              })
            );
          }
        }

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot("css");
        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
        expect(logs).toMatchSnapshot("logs");
      });
    });
  });
});
