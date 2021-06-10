function getImplementationByName(implementationName) {
  if (implementationName === "node-sass") {
    // eslint-disable-next-line global-require
    return require("node-sass");
  } else if (implementationName === "dart-sass") {
    // eslint-disable-next-line global-require
    return require("sass");
  } else if (implementationName === "sass_string") {
    return require.resolve("sass");
  }

  throw new Error(`Can't find ${implementationName}`);
}

export default getImplementationByName;
