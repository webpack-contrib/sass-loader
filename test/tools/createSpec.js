"use strict";

const sass = require("node-sass");
const os = require("os");
const fs = require("fs");
const path = require("path");
const customImporter = require("./customImporter.js");
const customFunctions = require("./customFunctions.js");

const testFolder = path.resolve(__dirname, "../");
const error = "error";

function createSpec(ext) {
    const basePath = path.join(testFolder, ext);
    const testNodeModules = path.relative(basePath, path.join(testFolder, "node_modules")) + path.sep;
    const pathToBootstrap = path.relative(basePath, path.resolve(testFolder, "..", "node_modules", "bootstrap-sass"));
    const pathToScopedNpmPkg = path.relative(basePath, path.resolve(testFolder, "node_modules", "@org", "pkg", "./index.scss"));

    fs.readdirSync(path.join(testFolder, ext))
        .filter((file) => {
            return path.extname(file) === "." + ext && file.slice(0, error.length) !== error;
        })
        .map((file) => {
            const fileName = path.join(basePath, file);
            const fileWithoutExt = file.slice(0, -ext.length - 1);
            const sassOptions = {
                importer(url) {
                    if (url === "import-with-custom-logic") {
                        return customImporter.returnValue;
                    }
                    if (/\.css$/.test(url) === false) { // Do not transform css imports
                        url = url
                            .replace(/^~bootstrap-sass/, pathToBootstrap)
                            .replace(/^~@org\/pkg/, pathToScopedNpmPkg)
                            .replace(/^~/, testNodeModules);
                    }
                    return {
                        file: url
                    };
                },
                functions: customFunctions,
                includePaths: [
                    path.join(testFolder, ext, "another"),
                    path.join(testFolder, ext, "includePath")
                ]
            };

            if (/prepending-data/.test(fileName)) {
                sassOptions.data = "$prepended-data: hotpink;" + os.EOL + fs.readFileSync(fileName, "utf8");
                sassOptions.indentedSyntax = /\.sass$/.test(fileName);
            } else {
                sassOptions.file = fileName;
            }

            const css = sass.renderSync(sassOptions).css;

            fs.writeFileSync(path.join(basePath, "spec", fileWithoutExt + ".css"), css, "utf8");
        });
}

module.exports = createSpec;
