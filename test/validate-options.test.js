import Fiber from 'fibers';

import {
  getCompiler,
  compile,
  getTestId,
  getImplementationByName,
} from './helpers/index';

describe('validate options', () => {
  beforeEach(() => {
    // The `sass` (`Dart Sass`) package modify the `Function` prototype, but the `jest` lose a prototype
    Object.setPrototypeOf(Fiber, Function.prototype);
  });

  const tests = {
    implementation: {
      // eslint-disable-next-line global-require
      success: [require('sass'), require('node-sass')],
      failure: [true, 'string'],
    },
    sassOptions: {
      success: [{}, { indentWidth: 6 }, () => ({ indentWidth: 6 })],
      failure: [true, 'string'],
    },
    additionalData: {
      success: ['$color: red;', (content) => `$color: red;\n${content}`],
      failure: [true],
    },
    sourceMap: {
      success: [true, false],
      failure: ['string'],
    },
    webpackImporter: {
      success: [true, false],
      failure: ['string'],
    },
    unknown: {
      success: [],
      failure: [1, true, false, 'test', /test/, [], {}, { foo: 'bar' }],
    },
  };

  function stringifyValue(value) {
    if (
      Array.isArray(value) ||
      (value && typeof value === 'object' && value.constructor === Object)
    ) {
      return JSON.stringify(value);
    }

    return value;
  }

  async function createTestCase(key, value, type) {
    it(`should ${
      type === 'success' ? 'successfully validate' : 'throw an error on'
    } the "${key}" option with "${stringifyValue(value)}" value`, async () => {
      const testId = getTestId('language', 'scss');
      const compiler = getCompiler(testId, {
        loader: {
          options: {
            implementation: getImplementationByName('dart-sass'),
            [key]: value,
          },
        },
      });
      let stats;

      try {
        stats = await compile(compiler);
      } finally {
        if (type === 'success') {
          expect(stats.hasErrors()).toBe(false);
        } else if (type === 'failure') {
          const {
            compilation: { errors },
          } = stats;

          expect(errors).toHaveLength(1);
          expect(() => {
            throw new Error(errors[0].error.message);
          }).toThrowErrorMatchingSnapshot();
        }
      }
    });
  }

  for (const [key, values] of Object.entries(tests)) {
    for (const type of Object.keys(values)) {
      for (const value of values[type]) {
        createTestCase(key, value, type);
      }
    }
  }
});
