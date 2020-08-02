import sass from 'sass';
import resolve from 'enhanced-resolve';

import createSassImporter from '../src/importer';

describe('importer', () => {
  it('should resolve imports when passed to `sass`', (done) => {
    const importer = createSassImporter(resolve.create);

    sass.render(
      {
        file: 'test/sass/imports.sass',
        importer,
      },
      (err, result) => {
        expect(result.css.toString()).toMatchSnapshot();

        done(err);
      }
    );
  });

  it('should pass `null` to `done()` when resolution fails', (done) => {
    let spy;
    // eslint-disable-next-line no-shadow
    const importer = (url, prev, done) => {
      spy = jest.fn(done);
      createSassImporter(resolve.create, sass)(url, prev, spy);
    };

    sass.render(
      {
        file: 'test/sass/error-file-not-found.sass',
        importer,
      },
      (err) => {
        expect(spy).toHaveBeenCalledWith(null);
        expect(err.toString()).toMatch("Can't find stylesheet to import.");

        done();
      }
    );
  });
});
