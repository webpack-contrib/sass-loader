"use strict";

const libsass = require("./libsass");

const compilers = [libsass];

const SUGGESTED_COMPILER_MESSAGE = "A Sass compiler is required by `sass-loader`, but none were found. Please install `node-sass` >= 4.";

function getCompilerQueue() {
    // Stores the first error encountered while loading a compiler (e.g. invalid version)
    // This error will be ignored if one of the compilers succeed (since we will eventually support multiple).
    let firstError;

    for (const compiler of compilers) {
        try {
            const value = compiler.getCompilerQueue();

            if (value == null) {
                continue;
            }
            return { error: false, reason: null, value };
        } catch (e) {
            if (firstError == null) {
                firstError = e;
            }
        }
    }
    // Return the error encountered while loading a compiler, otherwise say
    // there was no compiler found.
    return {
        error: true,
        reason: firstError || new Error(SUGGESTED_COMPILER_MESSAGE),
        value: null
    };
}

module.exports = {
    getCompilerQueue
};
