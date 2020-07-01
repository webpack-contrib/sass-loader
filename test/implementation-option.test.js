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
  normalizeImplementationError,
} from './helpers';

const implementations = [nodeSass, dartSass];

jest.setTimeout(30000);

describe('implementation option', () => {
  beforeEach(() => {
    // The `sass` (`Dart Sass`) package modify the `Function` prototype, but the `jest` lose a prototype
    Object.setPrototypeOf(Fiber, Function.prototype);
    jest.clearAllMocks();
  });

  implementations.forEach((implementation) => {
    const [implementationName] = implementation.info.split('\t');

    it(`${implementationName}`, async () => {
      const nodeSassSpy = jest.spyOn(nodeSass, 'render');
      const dartSassSpy = jest.spyOn(dartSass, 'render');

      const testId = getTestId('language', 'scss');
      const options = {
        implementation: getImplementationByName(implementationName),
      };
      const compiler = getCompiler(testId, { loader: { options } });
      const stats = await compile(compiler);
      const { css, sourceMap } = getCodeFromBundle(stats, compiler);

      expect(css).toBeDefined();
      expect(sourceMap).toBeUndefined();

      expect(getWarnings(stats)).toMatchSnapshot('warnings');
      expect(getErrors(stats)).toMatchSnapshot('errors');

      if (implementationName === 'node-sass') {
        expect(nodeSassSpy).toHaveBeenCalledTimes(1);
        expect(dartSassSpy).toHaveBeenCalledTimes(0);
      } else if (implementationName === 'dart-sass') {
        expect(nodeSassSpy).toHaveBeenCalledTimes(0);
        expect(dartSassSpy).toHaveBeenCalledTimes(1);
      }
    });
  });

  it('not specify', async () => {
    const nodeSassSpy = jest.spyOn(nodeSass, 'render');
    const dartSassSpy = jest.spyOn(dartSass, 'render');

    const testId = getTestId('language', 'scss');
    const options = {};
    const compiler = getCompiler(testId, { loader: { options } });
    const stats = await compile(compiler);
    const { css, sourceMap } = getCodeFromBundle(stats, compiler);

    expect(css).toBeDefined();
    expect(sourceMap).toBeUndefined();

    expect(getWarnings(stats)).toMatchSnapshot('warnings');
    expect(getErrors(stats)).toMatchSnapshot('errors');

    expect(nodeSassSpy).toHaveBeenCalledTimes(0);
    expect(dartSassSpy).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when the "node-sass" package is an incompatible version', async () => {
    const testId = getTestId('language', 'scss');
    const options = {
      implementation: Object.assign({}, nodeSass, {
        info: 'node-sass\t3.0.0',
      }),
    };

    const compiler = getCompiler(testId, { loader: { options } });

    try {
      const stats = await compile(compiler);

      getCodeFromBundle(stats, compiler);
    } catch (error) {
      expect(normalizeImplementationError(error)).toMatchSnapshot();
    }
  });

  it('should throw an error when the "sass" package is an incompatible version', async () => {
    const testId = getTestId('language', 'scss');
    const options = {
      implementation: Object.assign({}, dartSass, {
        info: 'dart-sass\t1.2.0',
      }),
    };

    const compiler = getCompiler(testId, { loader: { options } });

    try {
      const stats = await compile(compiler);

      getCodeFromBundle(stats, compiler);
    } catch (error) {
      expect(normalizeImplementationError(error)).toMatchSnapshot();
    }
  });

  it('should throw an error on an unknown sass implementation', async () => {
    const testId = getTestId('language', 'scss');
    const options = {
      implementation: Object.assign({}, dartSass, {
        info: 'strange-sass\t1.0.0',
      }),
    };

    const compiler = getCompiler(testId, { loader: { options } });

    try {
      const stats = await compile(compiler);

      getCodeFromBundle(stats, compiler);
    } catch (error) {
      expect(normalizeImplementationError(error)).toMatchSnapshot();
    }
  });

  it('should throw an error when the "info" is unparseable', async () => {
    const testId = getTestId('language', 'scss');
    const options = {
      implementation: Object.assign({}, dartSass, { info: 'asdfj' }),
    };

    const compiler = getCompiler(testId, { loader: { options } });

    try {
      const stats = await compile(compiler);

      getCodeFromBundle(stats, compiler);
    } catch (error) {
      expect(normalizeImplementationError(error)).toMatchSnapshot();
    }
  });

  it('should throw an error when the "info" is unparseable #2', async () => {
    const testId = getTestId('language', 'scss');
    const options = {
      implementation: Object.assign({}, nodeSass, { info: 'node-sass\t1' }),
    };

    const compiler = getCompiler(testId, { loader: { options } });

    try {
      const stats = await compile(compiler);

      getCodeFromBundle(stats, compiler);
    } catch (error) {
      expect(normalizeImplementationError(error)).toMatchSnapshot();
    }
  });

  it('should throw error when the "info" does not exist', async () => {
    const testId = getTestId('language', 'scss');
    const options = {
      // eslint-disable-next-line no-undefined
      implementation: Object.assign({}, dartSass, { info: undefined }),
    };

    const compiler = getCompiler(testId, { loader: { options } });

    try {
      const stats = await compile(compiler);

      getCodeFromBundle(stats, compiler);
    } catch (error) {
      expect(normalizeImplementationError(error)).toMatchSnapshot();
    }
  });

  it('should not swallow an error when trying to load a sass implementation', async () => {
    jest.doMock('node-sass', () => {
      const error = new Error('Some error');

      error.code = 'MODULE_NOT_FOUND';
      error.stack = null;

      throw error;
    });

    jest.doMock('sass', () => {
      const error = new Error('Some error');

      error.code = 'MODULE_NOT_FOUND';
      error.stack = null;

      throw error;
    });

    const testId = getTestId('language', 'scss');
    const options = {};

    const compiler = getCompiler(testId, { loader: { options } });

    try {
      const stats = await compile(compiler);

      getCodeFromBundle(stats, compiler);
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });
});
