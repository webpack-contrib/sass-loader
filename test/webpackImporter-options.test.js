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

let Fiber;
const implementations = getImplementations();
const syntaxStyles = ["scss", "sass"];

describe("webpackImporter option", () => {
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

      it(`not specify (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId("language", syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = await getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot("css");
        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });

      it(`false (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId("language", syntax);
        const options = {
          webpackImporter: false,
          implementation: getImplementationByName(implementationName),
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = await getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot("css");
        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });

      it(`true (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId("language", syntax);
        const options = {
          webpackImporter: true,
          implementation: getImplementationByName(implementationName),
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = await getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot("css");
        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });
    });
  });
});
