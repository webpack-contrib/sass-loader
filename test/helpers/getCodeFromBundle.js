const vm = require('vm');

function getCodeFromBundle(stats, assetName) {
  let code = null;

  if (
    stats &&
    stats.compilation &&
    stats.compilation.assets &&
    stats.compilation.assets[assetName || 'main.bundle.js']
  ) {
    code = stats.compilation.assets[assetName || 'main.bundle.js'].source();
  }

  if (!code) {
    throw new Error("Can't find compiled code");
  }

  const result = vm.runInNewContext(`module.export = ${code}`, {
    module: {},
  });

  return result.default;
}

export default getCodeFromBundle;
