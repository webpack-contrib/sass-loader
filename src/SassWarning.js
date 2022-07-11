class SassWarning extends Error {
  constructor(warning, options) {
    super(warning);

    this.name = "SassWarning";
    this.hideStack = true;

    if (options.span) {
      this.loc = {
        line: options.span.start.line,
        column: options.span.start.column,
      };
    }
  }
}

module.exports = SassWarning;
