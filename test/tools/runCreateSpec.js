"use strict";

const createSpec = require("./createSpec.js");

["scss", "sass"].forEach((ext) => {
    createSpec(ext);
});
