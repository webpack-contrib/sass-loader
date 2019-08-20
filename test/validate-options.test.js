import loader from '../src/cjs';

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

  // eslint-disable-next-line global-require
  // expect(() => validate({ implementation: require('node-sass') })).not.toThrow();
  // eslint-disable-next-line global-require
  // expect(() => validate({ implementation: require('sass') })).not.toThrow();
  // expect(() => validate({ implementation: true })).not.toThrow();

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
