"use strict";
const async = require("neo-async");

function getCompilerQueue() {
    let sass;
    let sassVersion;

    try {
        sass = require("sass");
        sassVersion = require("sass/package.json").version;
    } catch (e) {
        return null;
    }

    if (Number(sassVersion[0]) !== 1) {
        throw new Error(
            "The installed version of `sass` is not compatible (expected: 1.x, actual: " +
                sassVersion +
                ")."
        );
    }

    // This queue makes sure sass leaves one thread available for executing
    // fs tasks when running the custom importer code.
    // This can be removed as soon as sass implements a fix for this.
    const threadPoolSize = process.env.UV_THREADPOOL_SIZE || 4;

    return async.queue(sass.render, threadPoolSize - 1);
}

module.exports = { getCompilerQueue };
