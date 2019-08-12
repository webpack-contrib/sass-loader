/**
 * @jest-environment node
 */

import nodeSass from 'node-sass';
import dartSass from 'sass';

import {
  compile,
  getTestId,
  getCode,
  getImplementationByName,
  normalizeError,
} from './helpers';

const implementations = [nodeSass, dartSass];

describe('implementation option', () => {
  beforeEach(() => {
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
      const stats = await compile(testId, { loader: { options } });
      const { content, sourceMap } = getCode(stats);

      expect(content).toBeDefined();
      expect(sourceMap).toBeUndefined();

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');

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
    const stats = await compile(testId, { loader: { options } });
    const { content, sourceMap } = getCode(stats);

    expect(content).toBeDefined();
    expect(sourceMap).toBeUndefined();

    expect(stats.compilation.warnings).toMatchSnapshot('warnings');
    expect(stats.compilation.errors).toMatchSnapshot('errors');

    expect(nodeSassSpy).toHaveBeenCalledTimes(1);
    expect(dartSassSpy).toHaveBeenCalledTimes(0);
  });

  it('should throw an error when the "node-sass" package is an incompatible version', async () => {
    const testId = getTestId('language', 'scss');
    const options = {
      implementation: Object.assign({}, nodeSass, {
        info: 'node-sass\t3.0.0',
      }),
    };

    try {
      const stats = await compile(testId, { loader: { options } });

      getCode(stats);
    } catch (error) {
      expect(normalizeError(error)).toMatchSnapshot();
    }
  });

  it('should throw an error when the "sass" package is an incompatible version', async () => {
    const testId = getTestId('language', 'scss');
    const options = {
      implementation: Object.assign({}, dartSass, {
        info: 'dart-sass\t1.2.0',
      }),
    };

    try {
      const stats = await compile(testId, { loader: { options } });

      getCode(stats);
    } catch (error) {
      expect(normalizeError(error)).toMatchSnapshot();
    }
  });

  it('should throw an error on an unknown sass implementation', async () => {
    const testId = getTestId('language', 'scss');
    const options = {
      implementation: Object.assign({}, dartSass, {
        info: 'strange-sass\t1.0.0',
      }),
    };

    try {
      const stats = await compile(testId, { loader: { options } });

      getCode(stats);
    } catch (error) {
      expect(normalizeError(error)).toMatchSnapshot();
    }
  });

  it('should throw an error when the "info" is unparseable', async () => {
    const testId = getTestId('language', 'scss');
    const options = {
      implementation: Object.assign({}, dartSass, { info: 'asdfj' }),
    };

    try {
      const stats = await compile(testId, { loader: { options } });

      getCode(stats);
    } catch (error) {
      expect(normalizeError(error)).toMatchSnapshot();
    }
  });

  it('should throw an error when the "info" is unparseable #2', async () => {
    const testId = getTestId('language', 'scss');
    const options = {
      implementation: Object.assign({}, dartSass, { info: 'node-sass\t1' }),
    };

    try {
      const stats = await compile(testId, { loader: { options } });

      getCode(stats);
    } catch (error) {
      expect(normalizeError(error)).toMatchSnapshot();
    }
  });

  it('should throw error when the "info" does not exist', async () => {
    const testId = getTestId('language', 'scss');
    const options = {
      // eslint-disable-next-line no-undefined
      implementation: Object.assign({}, dartSass, { info: undefined }),
    };

    try {
      const stats = await compile(testId, { loader: { options } });

      getCode(stats);
    } catch (error) {
      expect(normalizeError(error)).toMatchSnapshot();
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

    try {
      const stats = await compile(testId, { loader: { options } });

      getCode(stats);
    } catch (error) {
      expect(error).toMatchSnapshot();
    }
  });
});
