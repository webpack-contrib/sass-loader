import nodeSass from "node-sass";
import dartSass from "sass";
// eslint-disable-next-line import/no-namespace
import * as sassEmbedded from "sass-embedded";

export default function getImplementations() {
  return [nodeSass, dartSass, sassEmbedded];
}
