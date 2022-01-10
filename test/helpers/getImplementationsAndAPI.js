import nodeSass from "node-sass";
import dartSass from "sass";

export default function getImplementationsAndAPI() {
  return [
    {
      name: nodeSass.info.split("\t")[0],
      implementation: nodeSass,
      api: "old",
    },
    {
      name: dartSass.info.split("\t")[0],
      implementation: dartSass,
      api: "old",
    },
    // {
    //   name: dartSass.info.split("\t")[0],
    //   implementation: dartSass,
    //   api: "modern",
    // },
  ];
}
