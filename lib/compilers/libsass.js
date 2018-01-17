"use strict";
const async = require("async");

function getCompilerQueue() {
    let sass;
    let sassVersion;

    try {
        sass = require("node-sass");
        sassVersion = require("node-sass/package.json").version;
    } catch (e) {
        return null;
    }

    if (Number(sassVersion[0]) < 4) {
        throw new Error("The installed version of \`node-sass\` is not compatible (expected: >= 4, actual: " + sassVersion + ").");
    }

    // This queue makes sure node-sass leaves one thread available for executing
    // fs tasks when running the custom importer code.
    // This can be removed as soon as node-sass implements a fix for this.
    const threadPoolSize = process.env.UV_THREADPOOL_SIZE || 4;

    return async.queue(sass.render, threadPoolSize - 1);
}

module.exports = { getCompilerQueue };
