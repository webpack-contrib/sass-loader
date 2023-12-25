function removeCWD(str) {
  const isWin = process.platform === "win32";
  let cwd = process.cwd();

  if (isWin) {
    // eslint-disable-next-line no-param-reassign
    str = str.replace(/\\/g, "/");
    // eslint-disable-next-line no-param-reassign
    cwd = cwd.replace(/\\/g, "/");
  }

  return str
    .replace(new RegExp(cwd, "g"), "")
    .replace(/file:\/\/\/\//g, "file:///");
}

export default (errors, needVerbose) =>
  errors.map((error) =>
    removeCWD(
      needVerbose
        ? error.toString()
        : error.toString().split("\n").slice(0, 2).join("\n")
    )
  );
