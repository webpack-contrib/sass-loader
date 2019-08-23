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

describe('prependData option', () => {
  implementations.forEach((implementation) => {
    const [implementationName] = implementation.info.split('\t');

    syntaxStyles.forEach((syntax) => {
      it(`should work with the "data" option as a string (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('prepending-data', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          prependData: `$prepended-data: hotpink${
            syntax === 'sass' ? '\n' : ';'
          }`,
        };
        const stats = await compile(testId, { loader: { options } });
        const codeFromBundle = getCodeFromBundle(stats);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });

      it(`should work with the "data" option as a function (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('prepending-data', syntax);
        const options = {
          implementation: getImplementationByName(implementationName),
          prependData: (loaderContext) => {
            expect(loaderContext).toBeDefined();

            return `$prepended-data: hotpink${syntax === 'sass' ? '\n' : ';'}`;
          },
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
