import url from "url";

import { isSupportedFibers } from "../src/utils";

import {
  compile,
  getCodeFromBundle,
  getCodeFromSass,
  getCompiler,
  getErrors,
  getImplementations,
  getImplementationByName,
  getTestId,
  getWarnings,
} from "./helpers";

jest.setTimeout(60000);

let Fiber;
const implementations = getImplementations({ nodeSass: false });
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

  implementations.forEach((implementation) => {
    const [implementationName] = implementation.info.split("\t");

    syntaxStyles.forEach((syntax) => {
      it(`should not emit warning by default (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId("logging", syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = await getCodeFromSass(testId, options);
        const logs = [];

        for (const [name, value] of stats.compilation.logging) {
          if (/sass-loader/.test(name)) {
            logs.push(
              value.map((item) => {
                return {
                  type: item.type,
                  args: item.args.map((arg) =>
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

      it(`should not emit warning when 'false' used (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId("logging", syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          warnRuleAsWarning: false,
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = await getCodeFromSass(testId, options);
        const logs = [];

        for (const [name, value] of stats.compilation.logging) {
          if (/sass-loader/.test(name)) {
            logs.push(
              value.map((item) => {
                return {
                  type: item.type,
                  args: item.args.map((arg) =>
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

      it(`should not emit warning when 'true' used (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId("logging", syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          warnRuleAsWarning: true,
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = await getCodeFromSass(testId, options);
        const logs = [];

        for (const [name, value] of stats.compilation.logging) {
          if (/sass-loader/.test(name)) {
            logs.push(
              value.map((item) => {
                return {
                  type: item.type,
                  args: item.args.map((arg) =>
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
