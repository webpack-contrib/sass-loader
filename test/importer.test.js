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
});
