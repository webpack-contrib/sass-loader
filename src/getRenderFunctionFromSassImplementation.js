import semver from 'semver';
import async from 'neo-async';

let nodeSassJobQueue = null;

/**
 * Verifies that the implementation and version of Sass is supported by this loader.
 *
 * @param {Object} module
 * @returns {Function}
 */
function getRenderFunctionFromSassImplementation(module) {
  const { info } = module;

  if (!info) {
    throw new Error('Unknown Sass implementation.');
  }

  const components = info.split('\t');

  if (components.length < 2) {
    throw new Error(`Unknown Sass implementation "${info}".`);
  }

  const [implementation, version] = components;

  if (!semver.valid(version)) {
    throw new Error(`Invalid Sass version "${version}".`);
  }

  if (implementation === 'dart-sass') {
    if (!semver.satisfies(version, '^1.3.0')) {
      throw new Error(
        `Dart Sass version ${version} is incompatible with ^1.3.0.`
      );
    }

    return module.render.bind(module);
  } else if (implementation === 'node-sass') {
    if (!semver.satisfies(version, '^4.0.0')) {
      throw new Error(
        `Node Sass version ${version} is incompatible with ^4.0.0.`
      );
    }

    // There is an issue with node-sass when async custom importers are used
    // See https://github.com/sass/node-sass/issues/857#issuecomment-93594360
    // We need to use a job queue to make sure that one thread is always available to the UV lib
    if (nodeSassJobQueue === null) {
      const threadPoolSize = Number(process.env.UV_THREADPOOL_SIZE || 4);

      nodeSassJobQueue = async.queue(
        module.render.bind(module),
        threadPoolSize - 1
      );
    }

    return nodeSassJobQueue.push.bind(nodeSassJobQueue);
  }

  throw new Error(`Unknown Sass implementation "${implementation}".`);
}

export default getRenderFunctionFromSassImplementation;
