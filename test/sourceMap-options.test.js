import fs from 'fs';
import path from 'path';

import nodeSass from 'node-sass';
import dartSass from 'sass';
import Fiber from 'fibers';

import {
  compile,
  getCodeFromBundle,
  getCompiler,
  getErrors,
  getImplementationByName,
  getTestId,
  getWarnings,
} from './helpers';

const implementations = [nodeSass, dartSass];
const syntaxStyles = ['scss', 'sass'];

describe('sourceMap option', () => {
  beforeEach(() => {
    // The `sass` (`Dart Sass`) package modify the `Function` prototype, but the `jest` lose a prototype
    Object.setPrototypeOf(Fiber, Function.prototype);
  });

  implementations.forEach((implementation) => {
    syntaxStyles.forEach((syntax) => {
      const [implementationName] = implementation.info.split('\t');

      it(`should generate source maps when value is not specified and the "devtool" option has "source-map" value (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const compiler = getCompiler(testId, {
          devtool: 'source-map',
          loader: { options },
        });
        const stats = await compile(compiler);
        const { css, sourceMap } = getCodeFromBundle(stats, compiler);

        expect(css).toBeDefined();
        expect(sourceMap).toBeDefined();
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should not generate source maps when value is not specified and the "devtool" option has "false" value (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const compiler = getCompiler(testId, {
          devtool: false,
          loader: { options },
        });
        const stats = await compile(compiler);
        const { css, sourceMap } = getCodeFromBundle(stats, compiler);

        expect(css).toBeDefined();
        expect(sourceMap).toBeUndefined();
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should not generate source maps when value has "false" value and the "devtool" option has "source-map" value (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sourceMap: false,
        };
        const compiler = getCompiler(testId, {
          devtool: 'source-map',
          loader: { options },
        });
        const stats = await compile(compiler);
        const { css, sourceMap } = getCodeFromBundle(stats, compiler);

        expect(css).toBeDefined();
        expect(sourceMap).toBeUndefined();
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should not generate source maps when value has "false" value and the "devtool" option has "false" value (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
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

        expect(css).toBeDefined();
        expect(sourceMap).toBeUndefined();
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should generate source maps when value has "true" value and the "devtool" option has "source-map" value (${implementationName}) (${syntax})`, async () => {
        expect.assertions(9);

        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sourceMap: true,
        };
        const compiler = getCompiler(testId, {
          devtool: 'source-map',
          loader: { options },
        });
        const stats = await compile(compiler);
        const { css, sourceMap } = getCodeFromBundle(stats, compiler);

        expect(css).toBeDefined();
        expect(sourceMap).toBeDefined();

        expect(sourceMap.file).toBeUndefined();
        expect(sourceMap.sourceRoot).toBeDefined();
        expect(sourceMap.sources).toHaveLength(2);

        sourceMap.sources.forEach((sourcePath) => {
          expect(
            fs.existsSync(path.resolve(sourceMap.sourceRoot, sourcePath))
          ).toBe(true);
        });

        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should generate source maps when value has "true" value and the "devtool" option has "false" value (${implementationName}) (${syntax})`, async () => {
        expect.assertions(9);

        const testId = getTestId('language', syntax);
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

        expect(css).toBeDefined();
        expect(sourceMap).toBeDefined();

        expect(sourceMap.file).toBeUndefined();
        expect(sourceMap.sourceRoot).toBeDefined();
        expect(sourceMap.sources).toHaveLength(2);

        sourceMap.sources.forEach((sourcePath) => {
          expect(
            fs.existsSync(path.resolve(sourceMap.sourceRoot, sourcePath))
          ).toBe(true);
        });

        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });
    });
  });
});
