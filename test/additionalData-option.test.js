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

let Fiber;
const implementations = getImplementationsAndAPI();
const syntaxStyles = ["scss", "sass"];

describe("additionalData option", () => {
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
      it(`should work as a string ('${implementationName}', '${api}' API, '${syntax}' syntax)`, async () => {
        const testId = getTestId("prepending-data", syntax);
        const options = {
          implementation,
          api,
          additionalData: `$prepended-data: hotpink${
            syntax === "sass" ? "\n" : ";"
          }`,
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

      it(`should work as a function ('${implementationName}', '${api}' API, '${syntax}' syntax)`, async () => {
        const testId = getTestId("prepending-data", syntax);
        const options = {
          implementation,
          api,
          additionalData: (content, loaderContext) => {
            expect(loaderContext).toBeDefined();
            expect(content).toBeDefined();

            return `$prepended-data: hotpink${
              syntax === "sass" ? "\n" : ";\n"
            }${content}`;
          },
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

      it(`should work as an async function ('${implementationName}', '${api}' API, '${syntax}' syntax)`, async () => {
        const testId = getTestId("prepending-data", syntax);
        const options = {
          implementation,
          api,
          additionalData: async (content, loaderContext) => {
            expect(loaderContext).toBeDefined();
            expect(content).toBeDefined();

            return `$prepended-data: hotpink${
              syntax === "sass" ? "\n" : ";\n"
            }${content}`;
          },
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

      it(`should use same EOL on all os ('${implementationName}', '${api}' API, '${syntax}' syntax)`, async () => {
        const testId = getTestId("prepending-data", syntax);
        const additionalData =
          syntax === "sass"
            ? `$prepended-data: hotpink
a
  color: $prepended-data`
            : `$prepended-data: hotpink;
a {
  color: red;
}`;
        const options = { implementation, api, additionalData };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);

        expect(codeFromBundle.css).toMatchSnapshot("css");
        expect(getWarnings(stats)).toMatchSnapshot("warnings");
        expect(getErrors(stats)).toMatchSnapshot("errors");
      });
    });
  });
});
