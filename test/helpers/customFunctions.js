export default (implementation) => {
  return {
    'headings($from: 0, $to: 6)': (from, to) => {
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
