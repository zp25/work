import path from 'path';
import { PATHS } from './constants';

const {
  context,
  entry,
} = PATHS.scripts;

export default {
  target: 'web',
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  context,
  entry,
  output: {
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js', '.json'],
    modules: [context, 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: context,
        use: ['babel-loader'],
      },
    ],
  },
};
