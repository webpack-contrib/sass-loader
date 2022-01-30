import nodeSass from "node-sass";
import dartSass from "sass";
// eslint-disable-next-line import/no-namespace
import * as SassEmbedded from "sass-embedded";

export default function getImplementationsAndAPI() {
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
}
