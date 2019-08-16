/**
 * @jest-environment node
 */
import path from 'path';

import nodeSass from 'node-sass';
import dartSass from 'sass';

import {
  compile,
  getTestId,
  getCodeFromBundle,
  getCodeFromSass,
  getImplementationByName,
  normalizeError,
} from './helpers';

import customImporter from './helpers/customImporter';
import customFunctions from './helpers/customFunctions';

const implementations = [nodeSass, dartSass];
const syntaxStyles = ['scss', 'sass'];

describe('loader', () => {
  implementations.forEach((implementation) => {
    const [implementationName] = implementation.info.split('\t');

    syntaxStyles.forEach((syntax) => {
      it(`should work (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work with the "importer" option (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('custom-importer', syntax);
        const options = {
          importer: customImporter,
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work with the "functions" option as an object (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('custom-functions', syntax);
        const options = {
          functions: customFunctions(implementation),
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work with the "functions" option as an object (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('custom-functions', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          functions: customFunctions(implementation),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work with the "functions" option as a function (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('custom-functions', syntax);
        const options = {
          functions: (loaderContext) => {
            expect(loaderContext).toBeDefined();

            return customFunctions(implementation);
          },
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work with the "data" option as a string (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('prepending-data', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          data: `$prepended-data: hotpink${syntax === 'sass' ? '\n' : ';'}`,
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work with the "data" option as a function (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('prepending-data', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          data: (loaderContext) => {
            expect(loaderContext).toBeDefined();

            return `$prepended-data: hotpink${syntax === 'sass' ? '\n' : ';'}`;
          },
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work with the "includePaths" option (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('import-include-paths', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          includePaths: [path.resolve(__dirname, syntax, 'includePath')],
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      // See https://github.com/webpack-contrib/sass-loader/issues/21
      it(`should work with an empty file (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('empty', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should output an understandable error (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('error', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(
          stats.compilation.errors.map((error) => normalizeError(error))
        ).toMatchSnapshot('errors');
      });

      it(`should output an understandable error when the problem in "@import" (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('error-import', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(
          stats.compilation.errors.map((error) => normalizeError(error))
        ).toMatchSnapshot('errors');
      });

      it(`should output an understandable error when a file could not be found (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('error-file-not-found', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(
          stats.compilation.errors.map((error) => normalizeError(error))
        ).toMatchSnapshot('errors');
      });

      it(`should throw an error with a explicit file and a file does not exist (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('error-file-not-found-2', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(
          stats.compilation.errors.map((error) => normalizeError(error))
        ).toMatchSnapshot('errors');
      });

      it(`should work with difference "@import" at-rules (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('imports', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      // Test for issue: https://github.com/webpack-contrib/sass-loader/issues/32
      it(`should work with multiple "@import" at-rules (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('multiple-imports', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      // Test for issue: https://github.com/webpack-contrib/sass-loader/issues/73
      it(`should work with an "@import" at-rle from other language style (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('import-other-style', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work when an "@import" at-rule from scoped npm packages (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('import-from-npm-org-pkg', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work when "@import" at-rules with extensions (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('import-with-extension', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work when "@import" at-rules starting with "_" (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('import-with-underscore', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work when "@import" at-rules without extensions and do not start with "_" (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId(
          'import-without-extension-and-underscore',
          syntax
        );
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work and use the "sass" field (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('import-sass-field', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work and use the "style" field (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('import-style-field', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work and use the "main" field (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('import-main-field', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work and use the "main" field when the "main" value is not in the "mainFields" resolve option (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('import-main-field', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, {
          loader: { options, resolve: { mainFields: [] } },
        });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work and use the "main" field when the "main" value already in the "mainFields" resolve option (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('import-main-field', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, {
          loader: { options, resolve: { mainFields: ['main', '...'] } },
        });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work and use the "custom-sass" field (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('import-custom-sass-field', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, {
          loader: { options, resolve: { mainFields: ['custom-sass', '...'] } },
        });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work and use the "index" file in package (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('import-index', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work and use the "index" file in package when the "index" value is not in the "mainFiles" resolve option (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('import-index', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, {
          loader: { options, resolve: { mainFiles: [] } },
        });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work and use the "index" file in package when the "index" value already in the "mainFiles" resolve option (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('import-index', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, {
          loader: { options, resolve: { mainFiles: ['index', '...'] } },
        });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work and use the "_index" file in package (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('import-_index', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      // Legacy support for CSS imports with node-sass
      // See discussion https://github.com/webpack-contrib/sass-loader/pull/573/files?#r199109203
      it(`should work and ignore all css "@import" at-rules (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('import-css', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work with an alias (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('import-alias', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, {
          resolve: {
            alias: {
              'path-to-alias': path.resolve(
                __dirname,
                syntax,
                'another',
                `alias.${syntax}`
              ),
            },
          },
          loader: { options },
        });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work with the "bootstrap-sass" package, directly import (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('bootstrap-sass', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work with the "bootstrap-sass" package, import as a package (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('bootstrap-sass-package', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work with the "bootstrap" package, import as a package (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('bootstrap', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(testId, options).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work and output the "compressed" outputStyle when "mode" is production (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, {
          mode: 'production',
          loader: { options },
        });

        expect(getCodeFromBundle(stats).css).toBe(
          getCodeFromSass(
            testId,
            Object.assign({}, options, {
              outputStyle: 'compressed',
            })
          ).css
        );

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });
    });
  });
});
