function normalizeError(error) {
  // eslint-disable-next-line no-param-reassign
  error.message = error.message.replace(/\\/gm, '/');
  // eslint-disable-next-line no-param-reassign
  error.message = error.message.replace(/\r\n/gm, '\n');
  // eslint-disable-next-line no-param-reassign
  error.message = error.message.replace(/\sat.*/gm, ' at ReplacedStackEntry');
  // eslint-disable-next-line no-param-reassign
  error.message = error.message.replace(
    / in .*? /g,
    ' in absolute_path_to_file '
  );

  return error;
}

export default normalizeError;
