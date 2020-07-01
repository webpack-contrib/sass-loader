import path from 'path';

import semver from 'semver';
import nodeSass from 'node-sass';
import dartSass from 'sass';
import Fiber from 'fibers';

import {
  compile,
  customImporter,
  customFunctions,
  getCodeFromBundle,
  getCodeFromSass,
  getErrors,
  getImplementationByName,
  getTestId,
  getWarnings,
  getCompiler,
} from './helpers';

const implementations = [nodeSass, dartSass];
const syntaxStyles = ['scss', 'sass'];

jest.setTimeout(30000);

describe('sassOptions option', () => {
  beforeEach(() => {
    // The `sass` (`Dart Sass`) package modify the `Function` prototype, but the `jest` lose a prototype
    Object.setPrototypeOf(Fiber, Function.prototype);
  });

  implementations.forEach((implementation) => {
    const [implementationName] = implementation.info.split('\t');

    syntaxStyles.forEach((syntax) => {
      it(`should work when the option like "Object" (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: {
            indentWidth: 10,
          },
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should work when the option is empty "Object" (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: {},
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should work when the option like "Function" (${implementationName}) (${syntax})`, async () => {
        expect.assertions(6);

        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: (loaderContext) => {
            expect(loaderContext).toBeDefined();

            return {
              indentWidth: 10,
            };
          },
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should work when the option like "Function" and never return (${implementationName}) (${syntax})`, async () => {
        expect.assertions(6);

        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: (loaderContext) => {
            expect(loaderContext).toBeDefined();
          },
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should ignore the "file" option (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: {
            file: 'test',
          },
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should ignore the "data" option (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: {
            data: 'test',
          },
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should work with the "functions" option (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('custom-functions', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: {
            functions: customFunctions(implementation),
          },
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should work with the "importer" as a single function option (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('custom-importer', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: {
            importer: customImporter,
          },
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should work with the "importer" as a array of functions option (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('custom-importer', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: {
            importer: [customImporter],
          },
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should work with the "importer" as a single function option (${implementationName}) (${syntax})`, async () => {
        expect.assertions(4);

        const testId = getTestId('custom-importer', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: {
            importer(url, prev, done) {
              expect(this.webpackLoaderContext).toBeDefined();

              return done({ contents: '.a { color: red; }' });
            },
          },
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);

        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should work with the "includePaths" option (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('import-include-paths', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: {
            includePaths: [path.resolve(__dirname, syntax, 'includePath')],
          },
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should work with the "indentType" option (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: {
            indentType: 'tab',
          },
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should work with the "indentWidth" option (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: {
            indentWidth: 4,
          },
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should work with the "indentedSyntax" option (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: {
            indentedSyntax: syntax === 'sass',
          },
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should work with the "linefeed" option (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: {
            linefeed: 'lf',
          },
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should work with the "fiber" option (${implementationName}) (${syntax})`, async () => {
        const dartSassSpy = jest.spyOn(dartSass, 'render');
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: {},
        };

        if (
          implementationName === 'dart-sass' &&
          semver.satisfies(process.version, '>= 10')
        ) {
          // eslint-disable-next-line global-require
          options.sassOptions.fiber = Fiber;
        }

        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        if (
          implementationName === 'dart-sass' &&
          semver.satisfies(process.version, '>= 10')
        ) {
          expect(dartSassSpy.mock.calls[0][0]).toHaveProperty('fiber');
        }

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');

        dartSassSpy.mockRestore();
      });

      it(`should use the "fibers" package if it is possible (${implementationName}) (${syntax})`, async () => {
        const dartSassSpy = jest.spyOn(dartSass, 'render');
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: {},
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        if (
          implementationName === 'dart-sass' &&
          semver.satisfies(process.version, '>= 10')
        ) {
          expect(dartSassSpy.mock.calls[0][0]).toHaveProperty('fiber');
        }

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');

        dartSassSpy.mockRestore();
      });

      it(`should don't use the "fibers" package when the "fiber" option is "false" (${implementationName}) (${syntax})`, async () => {
        const dartSassSpy = jest.spyOn(dartSass, 'render');
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: { fiber: false },
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        if (
          implementationName === 'dart-sass' &&
          semver.satisfies(process.version, '>= 10')
        ) {
          expect(dartSassSpy.mock.calls[0][0]).not.toHaveProperty('fiber');
        }

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');

        dartSassSpy.mockRestore();
      });

      it(`should respect the "outputStyle" option (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sassOptions: {
            outputStyle: 'expanded',
          },
        };
        const compiler = getCompiler(testId, {
          mode: 'production',
          loader: { options },
        });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should use "compressed" output style in the "production" mode (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const compiler = getCompiler(testId, {
          mode: 'production',
          loader: { options },
        });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, {
          ...options,
          sassOptions: {
            outputStyle: 'compressed',
          },
        });

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });
    });
  });
});
