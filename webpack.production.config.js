import path from 'path';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import dotenv from 'dotenv';
import { PATHS } from './constants';

dotenv.config({ silent: true });

const {
  context,
  entry,
} = PATHS.scripts;

const plugins = process.env.BUILD_ENV === 'debug' ? [
  new BundleAnalyzerPlugin({
    analyzerPort: process.env.PROD_PORT || 3001,
  }),
] : [];

export default {
  target: 'web',
  mode: 'production',
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
  plugins,
};
