const nodeSass = require("node-sass");
const dartSass = require("sass");
// eslint-disable-next-line import/no-namespace
const SassEmbedded = require("sass-embedded");

module.exports = function getImplementationsAndAPI() {
  return [
    {
      name: nodeSass.info.split("\t")[0],
      implementation: nodeSass,
      api: "legacy",
    },
    {
      name: dartSass.info.split("\t")[0],
      implementation: dartSass,
      api: "legacy",
    },
    {
      name: dartSass.info.split("\t")[0],
      implementation: dartSass,
      api: "modern",
    },
    {
      name: SassEmbedded.info.split("\t")[0],
      implementation: SassEmbedded,
      api: "legacy",
    },
    {
      name: SassEmbedded.info.split("\t")[0],
      implementation: SassEmbedded,
      api: "modern",
    },
  ];
};
