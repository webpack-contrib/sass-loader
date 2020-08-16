import { fileURLToPath } from 'url';

import enhanced from 'enhanced-resolve';

import { getWebpackResolver } from '../src/utils';

/**
 * Because `getWebpackResolver` is a public function that can be imported by
 * external packages, we want to test it separately to ensure its API does not
 * change unexpectedly.
 */
describe('getWebpackResolver', () => {
  const resolve = (request, ...options) =>
    getWebpackResolver(enhanced.create, ...options)(__filename, request);

  it('should resolve .scss from node_modules', async () => {
    expect(await resolve('scss/style')).toMatch(/style\.scss$/);
  });

  it('should resolve from passed `includePaths`', async () => {
    expect(await resolve('empty', null, [`${__dirname}/scss`])).toMatch(
      /empty\.scss$/
    );
  });

  it('should reject when file cannot be resolved', async () => {
    await expect(resolve('foo/bar/baz')).rejects.toBe();
  });

  it('should strip an invalid file URL of its scheme', async () => {
    const invalidFileURL = 'file://scss/empty';

    expect(() => fileURLToPath(invalidFileURL)).toThrow();
    expect(await resolve(invalidFileURL)).toMatch(/empty\.scss$/);
  });
});
