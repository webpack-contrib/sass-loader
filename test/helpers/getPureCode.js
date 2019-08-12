import path from 'path';
import os from 'os';
import fs from 'fs';

function getPureCode(testId, options) {
  const sassOptions = Object.assign({}, options);

  const { implementation } = sassOptions;
  const isNodeSassImplementation = sassOptions.implementation.info.includes(
    'node-sass'
  );

  delete sassOptions.implementation;

  if (sassOptions.data) {
    sassOptions.indentedSyntax = /\.sass$/i.test(testId);
    sassOptions.data = `$prepended-data: hotpink${
      sassOptions.indentedSyntax ? '\n' : ';'
    }${os.EOL}${fs.readFileSync(
      path.resolve(__dirname, '..', testId),
      'utf8'
    )}`;
  } else {
    sassOptions.file = path.resolve(__dirname, '..', testId);
  }

  if (typeof sassOptions.functions === 'function') {
    sassOptions.functions = sassOptions.functions({ moc: true });
  }

  const testFolder = path.resolve(__dirname, '../');
  const testNodeModules = path.resolve(testFolder, 'node_modules') + path.sep;
  const pathToSassPackageWithIndexFile = path.resolve(
    testFolder,
    'node_modules/sass-package-with-index/index.sass'
  );
  const pathToSCSSPackageWithIndexFile = path.resolve(
    testFolder,
    'node_modules/scss-package-with-index/index.scss'
  );
  const pathToAlias = path.resolve(
    testFolder,
    path.extname(testId).slice(1),
    'another',
    `alias.${path.extname(testId).slice(1)}`
  );
  const pathToSCSSSassField = path.resolve(
    testFolder,
    'node_modules/scss-sass-field/nested/style.scss'
  );
  const pathToSassSassField = path.resolve(
    testFolder,
    'node_modules/sass-sass-field/nested/style.sass'
  );
  const pathToSCSSStyleField = path.resolve(
    testFolder,
    'node_modules/scss-style-field/nested/style.scss'
  );
  const pathToSassStyleField = path.resolve(
    testFolder,
    'node_modules/sass-style-field/nested/style.sass'
  );
  const pathToSCSSMainField = path.resolve(
    testFolder,
    'node_modules/scss-main-field/nested/style.scss'
  );
  const pathToSassMainField = path.resolve(
    testFolder,
    'node_modules/sass-main-field/nested/style.sass'
  );
  const pathToScopedNpmPkg = path.resolve(
    testFolder,
    'node_modules/@org/pkg/index.scss'
  );
  const pathToSCSSCustomSassField = path.resolve(
    testFolder,
    'node_modules/scss-custom-sass-field/nested/style.scss'
  );
  const pathToSassCustomSassField = path.resolve(
    testFolder,
    'node_modules/sass-custom-sass-field/nested/style.sass'
  );
  const pathToBootstrapEntry = path.resolve(
    testFolder,
    '../node_modules/bootstrap-sass/assets/stylesheets/_bootstrap.scss'
  );
  const pathToBootstrapPackage = path.resolve(
    testFolder,
    '../node_modules/bootstrap-sass'
  );
  const pathToModule = path.resolve(
    testFolder,
    'node_modules/module/module.scss'
  );
  const pathToAnother = path.resolve(
    testFolder,
    'node_modules/another/module.scss'
  );

  // Pseudo importer for tests
  function testImporter(url) {
    // Do not transform css imports
    if (/\.css$/i.test(url) === false) {
      // Polyfill for node-sass implementation
      if (isNodeSassImplementation) {
        if (url === '~sass-package-with-index') {
          return {
            file: pathToSassPackageWithIndexFile,
          };
        }

        if (url === '~scss-package-with-index') {
          return {
            file: pathToSCSSPackageWithIndexFile,
          };
        }
      }

      // eslint-disable-next-line no-param-reassign
      url = url
        .replace(/^path-to-alias/, pathToAlias)
        .replace(/^~scss-sass-field/, pathToSCSSSassField)
        .replace(/^~sass-sass-field/, pathToSassSassField)
        .replace(/^~scss-style-field/, pathToSCSSStyleField)
        .replace(/^~sass-style-field/, pathToSassStyleField)
        .replace(/^~scss-main-field/, pathToSCSSMainField)
        .replace(/^~sass-main-field/, pathToSassMainField)
        .replace(/^~scss-custom-sass-field/, pathToSCSSCustomSassField)
        .replace(/^~sass-custom-sass-field/, pathToSassCustomSassField)
        .replace(/^~@org\/pkg/, pathToScopedNpmPkg)
        .replace(/^~bootstrap-sass$/, pathToBootstrapEntry)
        .replace(/^~bootstrap-sass/, pathToBootstrapPackage)
        .replace(/^~module/, pathToModule)
        .replace(/^~another/, pathToAnother)
        .replace(/^~/, testNodeModules);
    }

    return {
      file: url,
    };
  }

  sassOptions.importer = sassOptions.importer
    ? [sassOptions.importer, testImporter]
    : [testImporter];

  const { css } = implementation.renderSync(sassOptions);

  return css.toString();
}

export default getPureCode;
