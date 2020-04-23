import path from 'path';

function toRelative(item) {
  if (typeof item === 'string') {
    return path.relative(process.cwd(), item);
  }

  return Array.from(item).map((i) => toRelative(i));
}

export default toRelative;
