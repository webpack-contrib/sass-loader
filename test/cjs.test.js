import loader from '../src';
import CJSLoader from '../src/cjs';

describe('cjs', () => {
  it('should exported loader', () => {
    expect(CJSLoader).toEqual(loader);
  });
});
