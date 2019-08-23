import nodeSass from 'node-sass';
import dartSass from 'sass';

import {
  compile,
  getTestId,
  getCodeFromBundle,
  getCodeFromSass,
  getImplementationByName,
} from './helpers';

const implementations = [nodeSass, dartSass];
const syntaxStyles = ['scss', 'sass'];

describe('webpackImporter option', () => {
  implementations.forEach((implementation) => {
    syntaxStyles.forEach((syntax) => {
      const [implementationName] = implementation.info.split('\t');

      it(`not specify (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });
        const codeFromBundle = getCodeFromBundle(stats);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`false (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          webpackImporter: false,
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });
        const codeFromBundle = getCodeFromBundle(stats);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`true (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('language', syntax);
        const options = {
          webpackImporter: true,
          implementation: getImplementationByName(implementationName),
        };
        const stats = await compile(testId, { loader: { options } });
        const codeFromBundle = getCodeFromBundle(stats);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });
    });
  });
});
