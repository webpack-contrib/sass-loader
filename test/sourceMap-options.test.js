/**
 * @jest-environment node
 */
import fs from 'fs';
import path from 'path';

import nodeSass from 'node-sass';
import dartSass from 'sass';

import {
  compile,
  getTestId,
  getCodeFromBundle,
  getImplementationByName,
} from './helpers';

const implementations = [nodeSass, dartSass];
const syntaxStyles = ['scss', 'sass'];

describe('sourceMap option', () => {
  implementations.forEach((implementation) => {
    syntaxStyles.forEach((syntax) => {
      const [implementationName] = implementation.info.split('\t');

      it(`not specify (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          // eslint-disable-next-line no-undefined
          sourceMap: undefined,
        };
        const stats = await compile(testId, { loader: { options } });
        const { css, sourceMap } = getCodeFromBundle(stats);

        expect(css).toBeDefined();
        expect(sourceMap).toBeUndefined();

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`false (${implementationName}) (${syntax})`, async () => {
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

      it(`true (${implementationName}) (${syntax})`, async () => {
        expect.assertions(9);

        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          sourceMap: true,
        };
        const stats = await compile(testId, { loader: { options } });
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
