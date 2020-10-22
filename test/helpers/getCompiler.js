import path from 'path';

import webpack from 'webpack';
import { createFsFromVolume, Volume } from 'memfs';
import del from 'del';

const module = (config) => {
  return {
    rules: config.rules
      ? config.rules
      : [
          {
            test: (config.loader && config.loader.test) || /\.s[ac]ss$/i,
            resolve: config.loader.resolve,
            use: [
              {
                loader: require.resolve('./testLoader'),
              },
              {
                loader: path.join(__dirname, '../../src/cjs.js'),
                options: (config.loader && config.loader.options) || {},
              },
            ],
          },
        ],
  };
};

const plugins = (config) => [].concat(config.plugins || []);

const output = (config) => {
  return {
    path: path.resolve(
      __dirname,
      `../outputs/${config.output ? config.output : ''}`
    ),
    filename: '[name].bundle.js',
    library: 'sassLoaderExport',
  };
};

export default function getCompiler(fixture, config = {}, options = {}) {
  // webpack Config
  // eslint-disable-next-line no-param-reassign
  config = {
    cache: config.cache ? config.cache : false,
    mode: config.mode || 'development',
    devtool: config.devtool || false,
    // context: path.resolve(__dirname, '..', 'fixtures'),
    context: path.resolve(__dirname, '..'),
    entry: config.entry || `./${fixture}`,
    output: output(config),
    module: module(config),
    plugins: plugins(config),
    optimization: {
      runtimeChunk: false,
      minimizer: [],
    },
    // eslint-disable-next-line no-undefined
    resolve: config.resolve || undefined,
  };
  // Compiler Options
  // eslint-disable-next-line no-param-reassign
  options = Object.assign({ output: false }, options);

  if (options.output) {
    del.sync(config.output.path);
  }

  const compiler = webpack(config);

  if (!options.output) {
    compiler.outputFileSystem = createFsFromVolume(new Volume());
    compiler.outputFileSystem.join = path.join.bind(path);
  }

  return compiler;
}
