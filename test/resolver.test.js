import { fileURLToPath } from 'url';

import enhanced from 'enhanced-resolve';
import sass from 'sass';

import { getWebpackResolver } from '../src/utils';

/**
 * Because `getWebpackResolver` is a public function that can be imported by
 * external packages, we want to test it separately to ensure its API does not
 * change unexpectedly.
 */
describe('getWebpackResolver', () => {
  const resolve = (request, ...options) =>
    getWebpackResolver(enhanced.create, sass, ...options)(__filename, request);

  it('should resolve .scss from node_modules', async () => {
    expect(await resolve('scss/style')).toMatch(/style\.scss$/);
  });

  it('should resolve from passed `includePaths`', async () => {
    expect(await resolve('empty', [`${__dirname}/scss`])).toMatch(
      /empty\.scss$/
    );
  });

  it('should reject when file cannot be resolved', async () => {
    await expect(resolve('foo/bar/baz')).rejects.toBe();
  });

  if (process.platform !== 'win32') {
    // a `file:` URI with two `/`s indicates the next segment is a hostname,
    // which Node restricts to `localhost` on Unix platforms. Because it is
    // nevertheless commonly used, the resolver converts it to a relative path.
    // Node does allow specifying remote hosts in the Windows environment, so
    // this test is restricted to Unix platforms.
    it('should convert an invalid file URL with an erroneous hostname to a relative path', async () => {
      const invalidFileURL = 'file://scss/empty';

      expect(() => fileURLToPath(invalidFileURL)).toThrow();
      expect(await resolve(invalidFileURL)).toMatch(/empty\.scss$/);
    });
  }
});
