import path from 'path';
import { PATHS } from './constants';

const {
  context,
  entry,
} = PATHS.scripts;

export default {
  target: 'web',
  mode: 'production',
  devtool: 'inline-source-map',
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
