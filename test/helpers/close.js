export default (compiler) =>
  new Promise((resolve, reject) => {
    compiler.close((error) => {
      if (error) {
        return reject(error);
      }

      return resolve();
    });
  });
