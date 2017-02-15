"use strict";

function testLoader(content, sourceMap) {
    testLoader.content = content;
    testLoader.sourceMap = sourceMap;

    return "";
}

testLoader.content = "";
testLoader.sourceMap = null;
testLoader.filename = __filename;

module.exports = testLoader;
