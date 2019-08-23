function getDefaultSassImplementation() {
  let sassImplPkg = 'node-sass';

  try {
    require.resolve('node-sass');
  } catch (error) {
    try {
      require.resolve('sass');
      sassImplPkg = 'sass';
    } catch (ignoreError) {
      sassImplPkg = 'node-sass';
    }
  }

  // eslint-disable-next-line import/no-dynamic-require, global-require
  return require(sassImplPkg);
}

export default getDefaultSassImplementation;
