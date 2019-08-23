import path from 'path';

function normalizeError(error) {
  // eslint-disable-next-line no-param-reassign
  error.message = error.message.replace(/\sat.*/g, ' at ReplacedStackEntry');
  // eslint-disable-next-line no-param-reassign
  error.message = error.message.replace(/\\/g, '/');
  // eslint-disable-next-line no-param-reassign
  error.message = error.message.replace(
    new RegExp(path.resolve(__dirname, '..').replace(/\\/g, '/'), 'g'),
    '/absolute/path/to'
  );

  return error;
}

export default normalizeError;
