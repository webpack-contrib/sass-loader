import nodeSass from 'node-sass';
import dartSass from 'sass';
import Fiber from 'fibers';

import {
  compile,
  getCodeFromBundle,
  getCodeFromSass,
  getCompiler,
  getErrors,
  getImplementationByName,
  getTestId,
  getWarnings,
} from './helpers';

const implementations = [nodeSass, dartSass];
const syntaxStyles = ['scss', 'sass'];

describe('prependData option', () => {
  beforeEach(() => {
    // The `sass` (`Dart Sass`) package modify the `Function` prototype, but the `jest` lose a prototype
    Object.setPrototypeOf(Fiber, Function.prototype);
  });

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
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
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
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);
        const codeFromSass = getCodeFromSass(testId, options);

        expect(codeFromBundle.css).toBe(codeFromSass.css);
        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });

      it(`should use same EOL on all os (${implementationName}) (${syntax})`, async () => {
        const testId = getTestId('prepending-data', syntax);
        const prependData =
          syntax === 'sass'
            ? `$prepended-data: hotpink
a
  color: $prepended-data`
            : `$prepended-data: hotpink;
a {
  color: red;
}`;
        const options = {
          implementation: getImplementationByName(implementationName),
          prependData,
        };
        const compiler = getCompiler(testId, { loader: { options } });
        const stats = await compile(compiler);
        const codeFromBundle = getCodeFromBundle(stats, compiler);

        expect(codeFromBundle.css).toMatchSnapshot('css');
        expect(getWarnings(stats)).toMatchSnapshot('warnings');
        expect(getErrors(stats)).toMatchSnapshot('errors');
      });
    });
  });
});
