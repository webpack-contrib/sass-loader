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
        expect.assertions(10);

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

        sourceMap.sourceRoot = '';
        sourceMap.sources = sourceMap.sources.map((source) => {
          expect(path.isAbsolute(source)).toBe(true);
          expect(source).toBe(path.normalize(source));
          expect(
            fs.existsSync(path.resolve(sourceMap.sourceRoot, source))
          ).toBe(true);

          return path
            .relative(path.resolve(__dirname, '..'), source)
            .replace(/\\/g, '/');
        });

        expect(css).toMatchSnapshot('css');
        expect(sourceMap).toMatchSnapshot('source map');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should generate source maps when value has "true" value and the "devtool" option has "source-map" value (${implementationName}) (${syntax})`, async () => {
        expect.assertions(10);

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

        sourceMap.sourceRoot = '';
        sourceMap.sources = sourceMap.sources.map((source) => {
          expect(path.isAbsolute(source)).toBe(true);
          expect(source).toBe(path.normalize(source));
          expect(
            fs.existsSync(path.resolve(sourceMap.sourceRoot, source))
          ).toBe(true);

          return path
            .relative(path.resolve(__dirname, '..'), source)
            .replace(/\\/g, '/');
        });

        expect(css).toMatchSnapshot('css');
        expect(sourceMap).toMatchSnapshot('source map');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should generate source maps when value has "true" value and the "devtool" option has "false" value (${implementationName}) (${syntax})`, async () => {
        expect.assertions(10);

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

        sourceMap.sourceRoot = '';
        sourceMap.sources = sourceMap.sources.map((source) => {
          expect(path.isAbsolute(source)).toBe(true);
          expect(source).toBe(path.normalize(source));
          expect(
            fs.existsSync(path.resolve(sourceMap.sourceRoot, source))
          ).toBe(true);

          return path
            .relative(path.resolve(__dirname, '..'), source)
            .replace(/\\/g, '/');
        });

        expect(css).toMatchSnapshot('css');
        expect(sourceMap).toMatchSnapshot('source map');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should generate source maps when value has "false" value, but the "sassOptions.sourceMap" has the "true" value (${implementationName}) (${syntax})`, async () => {
        expect.assertions(8);

        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sourceMap: false,
          sassOptions: {
            sourceMap: true,
            outFile: path.join(__dirname, 'style.css.map'),
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

        sourceMap.sourceRoot = '';
        sourceMap.sources = sourceMap.sources.map((source) => {
          expect(path.isAbsolute(source)).toBe(false);
          expect(
            fs.existsSync(path.resolve(__dirname, path.normalize(source)))
          ).toBe(true);

          return path
            .relative(path.resolve(__dirname, '..'), source)
            .replace(/\\/g, '/');
        });

        expect(css).toMatchSnapshot('css');
        expect(sourceMap).toMatchSnapshot('source map');
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

        expect(css).toMatchSnapshot('css');
        expect(sourceMap).toMatchSnapshot('source map');
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

        expect(css).toMatchSnapshot('css');
        expect(sourceMap).toMatchSnapshot('source map');
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

        expect(css).toMatchSnapshot('css');
        expect(sourceMap).toMatchSnapshot('source map');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });
    });
  });
});
