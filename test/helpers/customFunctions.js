export default (api, implementation) => {
  if (api === "modern") {
    return {
      // Note: in real code, you should use `math.pow()` from the built-in
      // `sass:math` module.
      // eslint-disable-next-line func-names
      "pow($base, $exponent)": function (args) {
        const base = args[0].assertNumber("base").assertNoUnits("base");
        const exponent = args[1]
          .assertNumber("exponent")
          .assertNoUnits("exponent");

        return new implementation.SassNumber(base.value ** exponent.value);
      },
    };
  }

  return {
    "headings($from: 0, $to: 6)": (from, to) => {
      const f = from.getValue();
      const t = to.getValue();
      const list = new implementation.types.List(t - f + 1);
      let i;

      for (i = f; i <= t; i++) {
        list.setValue(i - f, new implementation.types.String(`h${i}`));
      }

      return list;
    },
  };
};
