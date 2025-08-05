export default (api, implementation) => {
  if (api === "modern" || api === "modern-compiler") {
    return {
      // Note: in real code, you should use `math.pow()` from the built-in
      // `sass:math` module.

      "pow($base, $exponent)"(args) {
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
      const fValue = from.getValue();
      const tValue = to.getValue();
      const list = new implementation.types.List(tValue - fValue + 1);
      let i;

      for (i = fValue; i <= tValue; i++) {
        list.setValue(i - fValue, new implementation.types.String(`h${i}`));
      }

      return list;
    },
  };
};
