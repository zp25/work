import path from 'path';
import webpack from 'webpack';
import { PATHS } from './constants';

export default {
  target: 'web',
  devtool: 'inline-source-map',
  context: PATHS.scripts.context,
  entry: PATHS.scripts.entry,
  output: {
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js', '.json'],
    modules: [PATHS.scripts.context, 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: PATHS.scripts.context,
        use: ['babel-loader'],
      },
    ],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
      },
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      filename: 'common.js',
      minChunks: 2,
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      output: {
        comments: false,
      },
      compress: {
        warnings: false,
      },
    }),
  ],
};
