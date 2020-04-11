function getDefaultSassImplementation() {
  let sassImplPkg = 'sass';

  try {
    require.resolve('sass');
  } catch (error) {
    try {
      require.resolve('node-sass');
      sassImplPkg = 'node-sass';
    } catch (ignoreError) {
      sassImplPkg = 'sass';
    }
  }

  // eslint-disable-next-line import/no-dynamic-require, global-require
  return require(sassImplPkg);
}

export default getDefaultSassImplementation;
