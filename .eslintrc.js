module.exports = {
  root: true,
  extends: ['@webpack-contrib/eslint-config-webpack', 'prettier'],
  overrides: [
    {
      files: [
        'test/watch/**/*.js',
        'test/hmr/**/*.js',
        'test/extractText/**/*.js',
        'test/helpers/testLoader.js',
      ],
      rules: {
        strict: 'off',
      },
    },
  ],
};
