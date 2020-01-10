import path from 'path';

function normalizeImplementationError(error) {
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

export default normalizeImplementationError;
