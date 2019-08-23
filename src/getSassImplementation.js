import semver from 'semver';

import getDefaultSassImplementation from './getDefaultSassImplementation';

function getSassImplementation(implementation) {
  let resolvedImplementation = implementation;

  if (!resolvedImplementation) {
    // eslint-disable-next-line no-param-reassign
    resolvedImplementation = getDefaultSassImplementation();
  }

  const { info } = resolvedImplementation;

  if (!info) {
    throw new Error('Unknown Sass implementation.');
  }

  const infoParts = info.split('\t');

  if (infoParts.length < 2) {
    throw new Error(`Unknown Sass implementation "${info}".`);
  }

  const [implementationName, version] = infoParts;

  if (implementationName === 'dart-sass') {
    if (!semver.satisfies(version, '^1.3.0')) {
      throw new Error(
        `Dart Sass version ${version} is incompatible with ^1.3.0.`
      );
    }

    return resolvedImplementation;
  } else if (implementationName === 'node-sass') {
    if (!semver.satisfies(version, '^4.0.0')) {
      throw new Error(
        `Node Sass version ${version} is incompatible with ^4.0.0.`
      );
    }

    return resolvedImplementation;
  }

  throw new Error(`Unknown Sass implementation "${implementationName}".`);
}

export default getSassImplementation;
