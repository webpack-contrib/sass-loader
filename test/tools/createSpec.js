'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const dartSass = require('sass');
const nodeSass = require('node-sass');

const customImporter = require('./customImporter.js');
const customFunctions = require('./customFunctions.js');

const implementations = [nodeSass, dartSass];
const testFolder = path.resolve(__dirname, '../');
const error = 'error';

function createSpec(ext) {
  const basePath = path.join(testFolder, ext);
  const testNodeModules =
    path.relative(basePath, path.join(testFolder, 'node_modules')) + path.sep;
  const pathToBootstrap = path.relative(
    basePath,
    path.resolve(testFolder, '..', 'node_modules', 'bootstrap-sass')
  );
  const pathToScopedNpmPkg = path.relative(
    basePath,
    path.resolve(testFolder, 'node_modules', '@org', 'pkg', './index.scss')
  );
  const pathToModule = path.relative(
    basePath,
    path.resolve(testFolder, 'node_modules', 'module', 'module.scss')
  );
  const pathToAnother = path.relative(
    basePath,
    path.resolve(testFolder, 'node_modules', 'another', 'module.scss')
  );
  const pathToFooAlias = path.relative(
    basePath,
    path.resolve(testFolder, ext, 'another', `alias.${ext}`)
  );
  const pathToScssSassField = path.relative(
    basePath,
    path.resolve(
      testFolder,
      'node_modules',
      'scss-sass-field',
      'nested',
      'style.scss'
    )
  );
  const pathToSASSSassField = path.relative(
    basePath,
    path.resolve(
      testFolder,
      'node_modules',
      'sass-sass-field',
      'nested',
      'style.sass'
    )
  );

  fs.readdirSync(path.join(testFolder, ext))
    .filter(
      (file) =>
        path.extname(file) === `.${ext}` &&
        file.slice(0, error.length) !== error
    )
    .forEach((file) => {
      const fileName = path.join(basePath, file);
      const fileWithoutExt = file.slice(0, -ext.length - 1);
      const sassOptions = {
        importer(url) {
          if (url === 'import-with-custom-logic') {
            return customImporter.returnValue;
          }
          // Do not transform css imports
          if (/\.css$/.test(url) === false) {
            // eslint-disable-next-line no-param-reassign
            url = url
              .replace(/^~scss-sass-field/, pathToScssSassField)
              .replace(/^~sass-sass-field/, pathToSASSSassField)
              .replace(/^~bootstrap-sass/, pathToBootstrap)
              .replace(/^~@org\/pkg/, pathToScopedNpmPkg)
              .replace(/^~module/, pathToModule)
              .replace(/^~another/, pathToAnother)
              .replace(/^~/, testNodeModules)
              .replace(/^path-to-alias/, pathToFooAlias);
          }
          return {
            file: url,
          };
        },
        includePaths: [
          path.join(testFolder, ext, 'another'),
          path.join(testFolder, ext, 'includePath'),
        ],
      };

      if (/prepending-data/.test(fileName)) {
        sassOptions.indentedSyntax = /\.sass$/.test(fileName);
        sassOptions.data = `$prepended-data: hotpink${
          sassOptions.indentedSyntax ? '\n' : ';'
        }${os.EOL}${fs.readFileSync(fileName, 'utf8')}`;
      } else {
        sassOptions.file = fileName;
      }

      implementations.forEach((implementation) => {
        if (fileWithoutExt === 'import-css' && implementation !== nodeSass) {
          // Skip CSS imports for all implementations that are not node-sass
          // CSS imports is a legacy feature that we only support for node-sass
          // See discussion https://github.com/webpack-contrib/sass-loader/pull/573/files?#r199109203
          return;
        }

        if (fileWithoutExt === 'import-index' && implementation !== dartSass) {
          // Skip CSS imports for all implementations that are not node-sass
          // CSS imports is a legacy feature that we only support for node-sass
          // See discussion https://github.com/webpack-contrib/sass-loader/pull/573/files?#r199109203
          return;
        }

        sassOptions.functions = customFunctions(implementation);

        const [name] = implementation.info.split('\t');
        const { css } = implementation.renderSync(sassOptions);

        fs.writeFileSync(
          path.join(basePath, 'spec', name, `${fileWithoutExt}.css`),
          css,
          'utf8'
        );
      });
    });
}

module.exports = createSpec;
