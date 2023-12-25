import normalizeErrors from "./normalizeErrors";

export default (stats, needVerbose) =>
  normalizeErrors(stats.compilation.warnings.sort(), needVerbose);
