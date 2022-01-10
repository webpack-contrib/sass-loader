import url from "url";
import path from "path";
import fs from "fs";

import { klona } from "klona/full";

async function getCodeFromSass(testId, options) {
  const loaderOptions = klona(options);
  let sassOptions = options.sassOptions || {};

  if (typeof sassOptions === "function") {
    sassOptions = sassOptions({ mock: true }) || {};
  }

  if (sassOptions.data) {
    delete sassOptions.data;
  }

  const { implementation } = loaderOptions;
  const isNodeSassImplementation =
    loaderOptions.implementation.info.includes("node-sass");
  const isModernAPI = options.api === "modern";

  delete loaderOptions.implementation;

  const isSass = /\.sass$/i.test(testId);

  const isIndentedSyntax = isSass;

  if (isModernAPI) {
    sassOptions.syntax = isIndentedSyntax ? "indented" : "scss";
  } else {
    sassOptions.indentedSyntax = isSass;
  }

  if (loaderOptions.additionalData) {
    sassOptions.data = `$prepended-data: hotpink${
      isIndentedSyntax ? "\n" : ";"
    }\n${fs.readFileSync(path.resolve(__dirname, "..", testId), "utf8")}`;
  } else if (isModernAPI) {
    const URL = url.pathToFileURL(path.resolve(__dirname, "..", testId));

    sassOptions.url = URL;
    sassOptions.data = fs.readFileSync(URL).toString();
  } else {
    sassOptions.file = path.resolve(__dirname, "..", testId);
  }

  const testFolder = path.resolve(__dirname, "../");
  const testNodeModules = path.resolve(testFolder, "node_modules") + path.sep;
  const pathToSassPackageWithIndexFile = path.resolve(
    testFolder,
    "node_modules/sass-package-with-index/index.sass"
  );
  const pathToSassPackageWithExportsFields = path.resolve(
    testFolder,
    "node_modules/package-with-exports/style.scss"
  );
  const pathToSCSSPackageWithIndexFile = path.resolve(
    testFolder,
    "node_modules/scss-package-with-index/index.scss"
  );
  const pathToSassPackageWithUnderscoreIndexFile = path.resolve(
    testFolder,
    "node_modules/sass-package-with-underscore-index/_index.sass"
  );
  const pathToSCSSPackageWithUnderscoreIndexFile = path.resolve(
    testFolder,
    "node_modules/scss-package-with-underscore-index/_index.scss"
  );
  const pathToSCSSUnderscoreDir = path.resolve(
    testFolder,
    "scss/_underscore-dir/_index.scss"
  );
  const pathToSCSSUnderscoreDir1 = path.resolve(
    testFolder,
    "scss/_underscore-dir-1/index.scss"
  );
  const pathToSCSSUnderscoreDir2 = path.resolve(
    testFolder,
    "scss/_underscore-dir-2/_index.sass"
  );
  const pathToSCSSUnderscoreDir3 = path.resolve(
    testFolder,
    "scss/_underscore-dir-3/index.sass"
  );
  // Avoid `.css` extensions because `node-sass` doesn't compile them
  const pathToSCSSUnderscoreDir4 = path.resolve(
    testFolder,
    "scss/_underscore-dir-4/_index"
  );
  // Avoid `.css` extensions because `node-sass` doesn't compile them
  const pathToSCSSUnderscoreDir5 = path.resolve(
    testFolder,
    "scss/_underscore-dir-5/index"
  );
  const pathToSassUnderscoreDir = path.resolve(
    testFolder,
    "sass/_underscore-dir/_index.sass"
  );
  const pathToSassUnderscoreDir1 = path.resolve(
    testFolder,
    "sass/_underscore-dir-1/index.sass"
  );
  const pathToSassUnderscoreDir2 = path.resolve(
    testFolder,
    "sass/_underscore-dir-2/_index.scss"
  );
  const pathToSassUnderscoreDir3 = path.resolve(
    testFolder,
    "sass/_underscore-dir-3/index.scss"
  );
  // Avoid `.css` extensions because `node-sass` doesn't compile them
  const pathToSassUnderscoreDir4 = path.resolve(
    testFolder,
    "sass/_underscore-dir-4/_index"
  );
  // Avoid `.css` extensions because `node-sass` doesn't compile them
  const pathToSassUnderscoreDir5 = path.resolve(
    testFolder,
    "sass/_underscore-dir-5/index"
  );
  const pathToSCSSWord6 = path.resolve(testFolder, "scss/word-6/_index.scss");
  const pathToSCSSWord7 = path.resolve(testFolder, "scss/word-7/index.scss");
  const pathToSCSSWord8 = path.resolve(testFolder, "scss/word-8/index.sass");
  const pathToSCSSWord9 = path.resolve(testFolder, "scss/word-9/index.sass");
  const pathToSCSSWord10 = path.resolve(testFolder, "scss/word-10/_index");
  const pathToSCSSWord11 = path.resolve(testFolder, "scss/word-11/index");
  const pathToSCSSDirectory6 = path.resolve(
    testFolder,
    "scss/directory-6/file/_index.scss"
  );
  const pathToSCSSDirectory7 = path.resolve(
    testFolder,
    "scss/directory-7/file/index.scss"
  );
  const pathToSCSSDirectory8 = path.resolve(
    testFolder,
    "scss/directory-8/file/_index.sass"
  );
  const pathToSCSSDirectory9 = path.resolve(
    testFolder,
    "scss/directory-9/file/index.sass"
  );
  const pathToSCSSDirectory10 = path.resolve(
    testFolder,
    "scss/directory-10/file/index"
  );
  const pathToSCSSDirectory11 = path.resolve(
    testFolder,
    "scss/directory-11/file/index"
  );
  const pathToSassWord6 = path.resolve(testFolder, "sass/word-6/_index.sass");
  const pathToSassWord7 = path.resolve(testFolder, "sass/word-7/index.sass");
  const pathToSassWord8 = path.resolve(testFolder, "sass/word-8/index.scss");
  const pathToSassWord9 = path.resolve(testFolder, "sass/word-9/index.scss");
  const pathToSassWord10 = path.resolve(testFolder, "sass/word-10/_index");
  const pathToSassWord11 = path.resolve(testFolder, "sass/word-11/index");
  const pathToSassDirectory6 = path.resolve(
    testFolder,
    "sass/directory-6/file/_index.sass"
  );
  const pathToSassDirectory7 = path.resolve(
    testFolder,
    "sass/directory-7/file/index.sass"
  );
  const pathToSassDirectory8 = path.resolve(
    testFolder,
    "sass/directory-8/file/_index.scss"
  );
  const pathToSassDirectory9 = path.resolve(
    testFolder,
    "sass/directory-9/file/index.scss"
  );
  const pathToSassDirectory10 = path.resolve(
    testFolder,
    "sass/directory-10/file/index"
  );
  const pathToSassDirectory11 = path.resolve(
    testFolder,
    "sass/directory-11/file/index"
  );
  const pathToAlias = path.resolve(
    testFolder,
    path.extname(testId).slice(1),
    "another",
    `alias.${path.extname(testId).slice(1)}`
  );
  const pathToSCSSSassField = path.resolve(
    testFolder,
    "node_modules/scss-sass-field/nested/style.scss"
  );
  const pathToSassSassField = path.resolve(
    testFolder,
    "node_modules/sass-sass-field/nested/style.sass"
  );
  const pathToSCSSStyleField = path.resolve(
    testFolder,
    "node_modules/scss-style-field/nested/style.scss"
  );
  const pathToSassStyleField = path.resolve(
    testFolder,
    "node_modules/sass-style-field/nested/style.sass"
  );
  const pathToSCSSMainField = path.resolve(
    testFolder,
    "node_modules/scss-main-field/nested/style.scss"
  );
  const pathToSassMainField = path.resolve(
    testFolder,
    "node_modules/sass-main-field/nested/style.sass"
  );
  const pathToSCSSAlias = path.resolve(
    testFolder,
    "scss/directory-6/file/_index.scss"
  );
  const pathToSassAlias = path.resolve(
    testFolder,
    "sass/directory-6/file/_index.sass"
  );
  const pathToSCSSIndexAlias = path.resolve(
    testFolder,
    "scss/dir-with-underscore-index/_index.scss"
  );
  const pathToSassIndexAlias = path.resolve(
    testFolder,
    "sass/dir-with-underscore-index/_index.sass"
  );
  const pathToScopedNpmPkg = path.resolve(
    testFolder,
    "node_modules/@org/pkg/index.scss"
  );
  const pathToScopedNpmFile = path.resolve(
    testFolder,
    "node_modules/@org/style.scss"
  );
  const pathToSCSSCustomSassField = path.resolve(
    testFolder,
    "node_modules/scss-custom-sass-field/nested/style.scss"
  );
  const pathToSassCustomSassField = path.resolve(
    testFolder,
    "node_modules/sass-custom-sass-field/nested/style.sass"
  );
  const pathToBootstrap3Entry = path.resolve(
    testFolder,
    "../node_modules/bootstrap-sass/assets/stylesheets/_bootstrap.scss"
  );
  const pathToBootstrap3Package = path.resolve(
    testFolder,
    "../node_modules/bootstrap-sass"
  );
  const pathToBootstrap4Entry = path.resolve(
    testFolder,
    "../node_modules/bootstrap-v4/scss/bootstrap.scss"
  );
  const pathToBootstrap5Entry = path.resolve(
    testFolder,
    "../node_modules/bootstrap-v5/scss/bootstrap.scss"
  );
  const pathToModule = path.resolve(
    testFolder,
    "node_modules/module/module.scss"
  );
  const pathToAnother = path.resolve(
    testFolder,
    "node_modules/another/module.scss"
  );
  const pathToPackageWithStyleFieldAndCss = isSass
    ? path.resolve(
        testFolder,
        "node_modules/package-with-style-field-and-css/sass/package-with-style-field-and-css.sass"
      )
    : path.resolve(
        testFolder,
        "node_modules/package-with-style-field-and-css/scss/package-with-style-field-and-css.scss"
      );
  const pathToPackageWithJsAndCssMainFiles = path.resolve(
    testFolder,
    "node_modules/package-with-js-and-css-main-files/index"
  );
  const pathToPackageWithJsMainField = path.resolve(
    testFolder,
    "node_modules/package-with-js-main-field/index.scss"
  );
  const pathToPackageWithIndex = path.resolve(
    testFolder,
    "node_modules/package-with-index/_index.scss"
  );
  const pathToLanguage = isSass
    ? path.resolve(testFolder, "sass/language.sass")
    : path.resolve(testFolder, "scss/language.scss");
  const pathToPackageWithSameImport = path.resolve(
    testFolder,
    "node_modules/package-with-same-import/style.scss"
  );
  const pathToMaterial = path.resolve(
    __dirname,
    "../../node_modules/@material"
  );
  const pathToCustomMainFiles = isSass
    ? path.resolve(testFolder, "sass/custom-main-files/custom.sass")
    : path.resolve(testFolder, "scss/custom-main-files/custom.scss");

  // Pseudo importer for tests
  function testImporter(url) {
    // Do not transform css imports
    if (/\.css$/i.test(url) === false) {
      // Polyfill for node-sass implementation
      if (isNodeSassImplementation) {
        if (url === "test/scss/dir-with-underscore-index") {
          return {
            file: pathToSCSSIndexAlias,
          };
        }

        if (url === "test/sass/dir-with-underscore-index") {
          return {
            file: pathToSassIndexAlias,
          };
        }

        if (url === "~sass-package-with-index") {
          return {
            file: pathToSassPackageWithIndexFile,
          };
        }

        if (url === "~sass-package-with-underscore-index") {
          return {
            file: pathToSassPackageWithUnderscoreIndexFile,
          };
        }

        if (url === "~scss-package-with-index") {
          return {
            file: pathToSCSSPackageWithIndexFile,
          };
        }

        if (url === "~scss-package-with-underscore-index") {
          return {
            file: pathToSCSSPackageWithUnderscoreIndexFile,
          };
        }

        // Fallback for `node-sass` what is not supported `index` and `_index` resolutions
        if (!isSass) {
          if (
            url === "_underscore-dir" ||
            url === "./_underscore-dir" ||
            url === "../scss/_underscore-dir"
          ) {
            return {
              file: pathToSCSSUnderscoreDir,
            };
          }

          if (
            url === "_underscore-dir-1" ||
            url === "./_underscore-dir-1" ||
            url === "../scss/_underscore-dir-1"
          ) {
            return {
              file: pathToSCSSUnderscoreDir1,
            };
          }

          if (
            url === "_underscore-dir-2" ||
            url === "./_underscore-dir-2" ||
            url === "../scss/_underscore-dir-2"
          ) {
            return {
              file: pathToSCSSUnderscoreDir2,
            };
          }

          if (
            url === "_underscore-dir-3" ||
            url === "./_underscore-dir-3" ||
            url === "../scss/_underscore-dir-3"
          ) {
            return {
              file: pathToSCSSUnderscoreDir3,
            };
          }

          if (
            url === "_underscore-dir-4" ||
            url === "./_underscore-dir-4" ||
            url === "../scss/_underscore-dir-4"
          ) {
            return {
              file: pathToSCSSUnderscoreDir4,
            };
          }

          if (
            url === "_underscore-dir-5" ||
            url === "./_underscore-dir-5" ||
            url === "../scss/_underscore-dir-5"
          ) {
            return {
              file: pathToSCSSUnderscoreDir5,
            };
          }

          if (
            url === "word-6" ||
            url === "./word-6" ||
            url === "../scss/word-6"
          ) {
            return {
              file: pathToSCSSWord6,
            };
          }

          if (
            url === "word-7" ||
            url === "./word-7" ||
            url === "../scss/word-7"
          ) {
            return {
              file: pathToSCSSWord7,
            };
          }

          if (
            url === "word-8" ||
            url === "./word-8" ||
            url === "../scss/word-8"
          ) {
            return {
              file: pathToSCSSWord8,
            };
          }

          if (
            url === "word-9" ||
            url === "./word-9" ||
            url === "../scss/word-9"
          ) {
            return {
              file: pathToSCSSWord9,
            };
          }

          if (
            url === "word-10" ||
            url === "./word-10" ||
            url === "../scss/word-10"
          ) {
            return {
              file: pathToSCSSWord10,
            };
          }

          if (
            url === "word-11" ||
            url === "./word-11" ||
            url === "../scss/word-11"
          ) {
            return {
              file: pathToSCSSWord11,
            };
          }

          if (
            url === "directory-6/file" ||
            url === "./directory-6/file" ||
            url === "../scss/directory-6/file"
          ) {
            return {
              file: pathToSCSSDirectory6,
            };
          }

          if (
            url === "directory-7/file" ||
            url === "./directory-7/file" ||
            url === "../scss/directory-7/file"
          ) {
            return {
              file: pathToSCSSDirectory7,
            };
          }

          if (
            url === "directory-8/file" ||
            url === "./directory-8/file" ||
            url === "../scss/directory-8/file"
          ) {
            return {
              file: pathToSCSSDirectory8,
            };
          }

          if (
            url === "directory-9/file" ||
            url === "./directory-9/file" ||
            url === "../scss/directory-9/file"
          ) {
            return {
              file: pathToSCSSDirectory9,
            };
          }

          if (
            url === "directory-10/file" ||
            url === "./directory-10/file" ||
            url === "../scss/directory-10/file"
          ) {
            return {
              file: pathToSCSSDirectory10,
            };
          }

          if (
            url === "directory-11/file" ||
            url === "./directory-11/file" ||
            url === "../scss/directory-11/file"
          ) {
            return {
              file: pathToSCSSDirectory11,
            };
          }
        } else {
          if (
            url === "_underscore-dir" ||
            url === "./_underscore-dir" ||
            url === "../sass/_underscore-dir"
          ) {
            return {
              file: pathToSassUnderscoreDir,
            };
          }

          if (
            url === "_underscore-dir-1" ||
            url === "./_underscore-dir-1" ||
            url === "../sass/_underscore-dir-1"
          ) {
            return {
              file: pathToSassUnderscoreDir1,
            };
          }

          if (
            url === "_underscore-dir-2" ||
            url === "./_underscore-dir-2" ||
            url === "../sass/_underscore-dir-2"
          ) {
            return {
              file: pathToSassUnderscoreDir2,
            };
          }

          if (
            url === "_underscore-dir-3" ||
            url === "./_underscore-dir-3" ||
            url === "../sass/_underscore-dir-3"
          ) {
            return {
              file: pathToSassUnderscoreDir3,
            };
          }

          if (
            url === "_underscore-dir-4" ||
            url === "./_underscore-dir-4" ||
            url === "../sass/_underscore-dir-4"
          ) {
            return {
              file: pathToSassUnderscoreDir4,
            };
          }

          if (
            url === "_underscore-dir-5" ||
            url === "./_underscore-dir-5" ||
            url === "../sass/_underscore-dir-5"
          ) {
            return {
              file: pathToSassUnderscoreDir5,
            };
          }

          if (
            url === "word-6" ||
            url === "./word-6" ||
            url === "../sass/word-6"
          ) {
            return {
              file: pathToSassWord6,
            };
          }

          if (
            url === "word-7" ||
            url === "./word-7" ||
            url === "../sass/word-7"
          ) {
            return {
              file: pathToSassWord7,
            };
          }

          if (
            url === "word-8" ||
            url === "./word-8" ||
            url === "../sass/word-8"
          ) {
            return {
              file: pathToSassWord8,
            };
          }

          if (
            url === "word-9" ||
            url === "./word-9" ||
            url === "../sass/word-9"
          ) {
            return {
              file: pathToSassWord9,
            };
          }

          if (
            url === "word-10" ||
            url === "./word-10" ||
            url === "../sass/word-10"
          ) {
            return {
              file: pathToSassWord10,
            };
          }

          if (
            url === "word-11" ||
            url === "./word-11" ||
            url === "../sass/word-11"
          ) {
            return {
              file: pathToSassWord11,
            };
          }

          if (
            url === "directory-6/file" ||
            url === "./directory-6/file" ||
            url === "../sass/directory-6/file"
          ) {
            return {
              file: pathToSassDirectory6,
            };
          }

          if (
            url === "directory-7/file" ||
            url === "./directory-7/file" ||
            url === "../sass/directory-7/file"
          ) {
            return {
              file: pathToSassDirectory7,
            };
          }

          if (
            url === "directory-8/file" ||
            url === "./directory-8/file" ||
            url === "../sass/directory-8/file"
          ) {
            return {
              file: pathToSassDirectory8,
            };
          }

          if (
            url === "directory-9/file" ||
            url === "./directory-9/file" ||
            url === "../sass/directory-9/file"
          ) {
            return {
              file: pathToSassDirectory9,
            };
          }

          if (
            url === "directory-10/file" ||
            url === "./directory-10/file" ||
            url === "../sass/directory-10/file"
          ) {
            return {
              file: pathToSassDirectory10,
            };
          }

          if (
            url === "directory-11/file" ||
            url === "./directory-11/file" ||
            url === "../sass/directory-11/file"
          ) {
            return {
              file: pathToSassDirectory11,
            };
          }
        }
      }

      // eslint-disable-next-line no-param-reassign
      url = url
        .replace(/^path-to-alias/, pathToAlias)
        .replace(
          /^package-with-style-field-and-css/,
          pathToPackageWithStyleFieldAndCss
        )
        .replace(/^~scss-sass-field/, pathToSCSSSassField)
        .replace(/^~sass-sass-field/, pathToSassSassField)
        .replace(/^~scss-style-field/, pathToSCSSStyleField)
        .replace(/^~sass-style-field/, pathToSassStyleField)
        .replace(/^~scss-main-field/, pathToSCSSMainField)
        .replace(/^~sass-main-field/, pathToSassMainField)
        .replace(/^~scss-custom-sass-field/, pathToSCSSCustomSassField)
        .replace(/^~sass-custom-sass-field/, pathToSassCustomSassField)
        .replace(/^~@scss$/, pathToSCSSAlias)
        .replace(/^~@sass$/, pathToSassAlias)
        .replace(
          /^~@path-to-scss-dir\/dir-with-underscore-index$/,
          pathToSCSSIndexAlias
        )
        .replace(
          /^~@path-to-scss-dir\/dir-with-underscore-index\/$/,
          pathToSCSSIndexAlias
        )
        .replace(
          /^~@path-to-sass-dir\/dir-with-underscore-index$/,
          pathToSassIndexAlias
        )
        .replace(
          /^~@path-to-sass-dir\/dir-with-underscore-index\/$/,
          pathToSassIndexAlias
        )
        .replace(
          /^~@\/path-to-scss-dir\/dir-with-underscore-index$/,
          pathToSCSSIndexAlias
        )
        .replace(
          /^~@\/path-to-sass-dir\/dir-with-underscore-index$/,
          pathToSassIndexAlias
        )
        .replace(/^~@org\/pkg/, pathToScopedNpmPkg)
        .replace(/^@org\/style/, pathToScopedNpmFile)
        .replace(/^~bootstrap-sass$/, pathToBootstrap3Entry)
        .replace(/^~bootstrap-sass/, pathToBootstrap3Package)
        .replace(/^~bootstrap-v4$/, pathToBootstrap4Entry)
        .replace(/^bootstrap-v4$/, pathToBootstrap4Entry)
        .replace(/^~bootstrap-v5$/, pathToBootstrap5Entry)
        .replace(/^bootstrap-v5$/, pathToBootstrap5Entry)
        .replace(/^~module/, pathToModule)
        .replace(/^~another/, pathToAnother)
        .replace(
          /^~package-with-js-and-css-main-files/,
          pathToPackageWithJsAndCssMainFiles
        )
        .replace(/^~package-with-js-main-field/, pathToPackageWithJsMainField)
        .replace(/^~package-with-index/, pathToPackageWithIndex)
        .replace(/^package-with-exports/, pathToSassPackageWithExportsFields)
        .replace(/^file:\/\/\/language/, pathToLanguage)
        .replace(/^\/sass\/language.sass/, pathToLanguage)
        .replace(/^\/scss\/language.scss/, pathToLanguage)
        .replace(/^file:\/\/\/scss\/language.scss/, pathToLanguage)
        .replace(/^file:\/\/\/sass\/language.sass/, pathToLanguage)
        .replace(
          /^package-with-same-import\/style/,
          pathToPackageWithSameImport
        )
        .replace(/@material/, pathToMaterial)
        .replace(/custom-main-files/, pathToCustomMainFiles)
        .replace(/^~/, testNodeModules);
    }

    return {
      file: url,
    };
  }

  if (!isModernAPI) {
    sassOptions.importer = sassOptions.importer
      ? []
          .concat(
            Array.isArray(sassOptions.importer)
              ? [...sassOptions.importer]
              : [sassOptions.importer]
          )
          .concat([testImporter])
      : [testImporter];
  }

  sassOptions.logger = { debug: () => {}, warn: () => {} };

  let css;
  let map;

  if (isModernAPI) {
    const { data, ...rest } = sassOptions;

    ({ css, sourceMap: map } = await implementation.compileStringAsync(
      data,
      rest
    ));
  } else {
    ({ css, map } = await new Promise((resolve, reject) => {
      implementation.render(sassOptions, (error, result) => {
        if (error) {
          reject(error);

          return;
        }

        resolve(result);
      });
    }));
  }

  return { css: css.toString(), sourceMap: map };
}

export default getCodeFromSass;
