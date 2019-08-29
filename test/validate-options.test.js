import Fiber from 'fibers';

import loader from '../src/cjs';

beforeEach(() => {
  // The `sass` (`Dart Sass`) package modify the `Function` prototype, but the `jest` lose a prototype
  Object.setPrototypeOf(Fiber, Function.prototype);
});

it('validate options', () => {
  const validate = (options) =>
    loader.call(
      Object.assign(
        {},
        {
          query: options,
          loaders: [],
          resourcePath: 'file.scss',
          getResolve: () => () => {},
          async: () => (error) => {
            if (error) {
              throw error;
            }
          },
        }
      ),
      'a { color: red; }'
    );

  expect(() =>
    // eslint-disable-next-line global-require
    validate({ implementation: require('node-sass') })
  ).not.toThrow();
  expect(() =>
    // eslint-disable-next-line global-require
    validate({ implementation: require('sass') })
  ).not.toThrow();
  expect(() =>
    validate({ implementation: true })
  ).toThrowErrorMatchingSnapshot();

  expect(() => validate({ sassOptions: {} })).not.toThrow();
  expect(() =>
    validate({
      sassOptions: () => {
        return {};
      },
    })
  ).not.toThrow();
  expect(() => validate({ sassOptions: () => {} })).not.toThrow();
  expect(() => validate({ sassOptions: true })).toThrowErrorMatchingSnapshot();
  expect(() =>
    validate({ sassOptions: { fiber: { mock: true } } })
  ).not.toThrow();
  expect(() =>
    validate({ sassOptions: { indentWidth: 6, linefeed: 'crlf' } })
  ).not.toThrow();

  expect(() => validate({ prependData: '$color: red;' })).not.toThrow();
  expect(() => validate({ prependData: () => '$color: red;' })).not.toThrow();
  expect(() => validate({ prependData: true })).toThrowErrorMatchingSnapshot();

  expect(() => validate({ webpackImporter: true })).not.toThrow();
  expect(() => validate({ webpackImporter: false })).not.toThrow();
  expect(() =>
    validate({ webpackImporter: 'unknown' })
  ).toThrowErrorMatchingSnapshot();

  expect(() => validate({ unknown: 'unknown' })).toThrowErrorMatchingSnapshot();
});
