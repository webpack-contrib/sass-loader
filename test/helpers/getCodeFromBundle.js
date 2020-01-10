import vm from 'vm';

import readAsset from './readAsset';

function getCodeFromBundle(stats, compiler, asset) {
  let code = null;

  if (
    stats &&
    stats.compilation &&
    stats.compilation.assets &&
    stats.compilation.assets[asset || 'main.bundle.js']
  ) {
    code = readAsset(asset || 'main.bundle.js', compiler, stats);
  }

  if (!code) {
    throw new Error("Can't find compiled code");
  }

  const result = vm.runInNewContext(
    `${code};\nmodule.exports = sassLoaderExport;`,
    {
      module: {},
    }
  );

  return result.default;
}

export default getCodeFromBundle;
