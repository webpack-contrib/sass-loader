"use strict";

/**
 * This file can be used to track changes in the spec introduced by newer node-sass versions.
 * This can be useful to check if the tests need to be adjusted to new behavior.
 *
 * If you want to check if there are any changes, do this:
 *
 * 1. First, install the old version of node-sass
 * 2. Run `npm run create-spec`
 * 3. Now install the new version of node-sass
 * 4. Remove .skip( from describe-block in this file to activate the test
 * 5. Run `npm run test`
 */

require("should");
const fs = require("fs");
const path = require("path");
const createSpec = require("./tools/createSpec.js");

const testFolder = __dirname;
const matchCss = /\.css$/;

function readSpec(folder) {
    const result = {};

    fs.readdirSync(folder)
        .forEach((file) => {
            if (matchCss.test(file)) {
                result[file] = fs.readFileSync(path.join(folder, file), "utf8");
            }
        });

    return result;
}

function writeSpec(folder, spec) {
    Object.keys(spec)
        .forEach((specName) => {
            fs.writeFileSync(path.resolve(folder, specName), spec[specName], "utf8");
        });
}

["scss", "sass"].forEach((ext) => {
    describe(ext + " spec", () => {
        const specFolder = path.resolve(testFolder, ext, "spec");
        const oldSpec = readSpec(specFolder);

        createSpec(ext);

        const newSpec = readSpec(specFolder);

        Object.keys(oldSpec)
            .forEach((specName) => {
                it(specName + " should not have been changed", () => {
                    oldSpec[specName].should.eql(newSpec[specName]);
                });
            });

        after(() => {
            // Write old spec back to the folder so that future tests will also fail
            writeSpec(specFolder, oldSpec);
        });
    });
});
