import fs from 'fs';
import path from 'path';

import nodeSass from 'node-sass';
import dartSass from 'sass';
import Fiber from 'fibers';

import {
  compile,
  getTestId,
  getCodeFromBundle,
  getImplementationByName,
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

      it(`should generate source maps when value is not specify and the "devtool" option has "source-map" value (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, {
          devtool: 'source-map',
          loader: { options },
        });
        const { css, sourceMap } = getCodeFromBundle(stats);

        expect(css).toBeDefined();
        expect(sourceMap).toBeDefined();

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should not generate source maps when value is not specify and the "devtool" option has "false" value (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });
        const { css, sourceMap } = getCodeFromBundle(stats);

        expect(css).toBeDefined();
        expect(sourceMap).toBeUndefined();

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should not generate source maps when value has "false" and the "devtool" option has "source-map" value (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sourceMap: false,
        };
        const stats = await compile(testId, {
          devtool: 'source-map',
          loader: { options },
        });
        const { css, sourceMap } = getCodeFromBundle(stats);

        expect(css).toBeDefined();
        expect(sourceMap).toBeUndefined();

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should not generate source maps when value has "false" and the "devtool" option has "false" value (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sourceMap: false,
        };
        const stats = await compile(testId, { loader: { options } });
        const { css, sourceMap } = getCodeFromBundle(stats);

        expect(css).toBeDefined();
        expect(sourceMap).toBeUndefined();

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should generate source maps when value has "true" value and the "devtool" option has "source-map" value (${implementationName}) (${syntax})`, async () => {
        expect.assertions(9);

        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sourceMap: true,
        };
        const stats = await compile(testId, {
          devtool: 'source-map',
          loader: { options },
        });
        const { css, sourceMap } = getCodeFromBundle(stats);

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

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should generate source maps when value has "true" value and the "devtool" option has "false" value (${implementationName}) (${syntax})`, async () => {
        expect.assertions(9);

        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sourceMap: true,
        };
        const stats = await compile(testId, {
          devtool: false,
          loader: { options },
        });
        const { css, sourceMap } = getCodeFromBundle(stats);

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

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });
    });
  });
});
