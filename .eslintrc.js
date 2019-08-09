module.exports = {
  root: true,
  extends: ['@webpack-contrib/eslint-config-webpack', 'prettier'],
  rules: {
    // temporary disable for test before we migrate on jest
    strict: 'off',
  },
};
