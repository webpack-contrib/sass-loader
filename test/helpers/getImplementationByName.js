function getImplementationByName(implementationName) {
  if (implementationName === 'node-sass') {
    // eslint-disable-next-line global-require
    return require('node-sass');
  } else if (implementationName === 'dart-sass') {
    // eslint-disable-next-line global-require
    return require('sass');
  }

  throw new Error(`Can't find ${implementationName}`);
}

export default getImplementationByName;
