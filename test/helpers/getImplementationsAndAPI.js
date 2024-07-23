import nodeSass from "node-sass";
import dartSass from "sass";
// eslint-disable-next-line import/no-namespace
import * as SassEmbedded from "sass-embedded";

import isNodeSassSupported from "./is-node-sass-supported";

export default function getImplementationsAndAPI() {
  const implementations = [
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
      name: dartSass.info.split("\t")[0],
      implementation: dartSass,
      api: "modern-compiler",
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
    {
      name: SassEmbedded.info.split("\t")[0],
      implementation: SassEmbedded,
      api: "modern-compiler",
    },
  ];

  if (isNodeSassSupported()) {
    implementations.unshift({
      name: nodeSass.info.split("\t")[0],
      implementation: nodeSass,
      api: "legacy",
    });
  }

  return implementations;
}
