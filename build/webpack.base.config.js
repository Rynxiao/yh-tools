const HtmlWebpackPlugin = require('html-webpack-plugin');
const { resolve } = require('path');
const CONFIG = require('./config');

const isDev = process.env.NODE_ENV === 'development';
const filePath = resolve(__dirname, '../src/index.jsx');

module.exports = {
  entry: {
    index: isDev ? [filePath, 'webpack-hot-middleware/client?reload=true'] : filePath,
  },

  output: {
    path: resolve(__dirname, `../${CONFIG.DIR.DIST}`),
    publicPath: CONFIG.PATH.PUBLIC_PATH,
    filename: `${CONFIG.DIR.SCRIPT}/[name].bundle.js`,
    chunkFilename: `${CONFIG.DIR.SCRIPT}/[name].[chunkhash].js`,
  },

  node: {
    fs: 'empty',
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@components': resolve(__dirname, '../src/components'),
      ejs: resolve(__dirname, '../node_modules/ejs', 'ejs.min.js'),
    },
    extensions: ['.js', '.jsx', '.less', '.json'],
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /(node_modules|lib|libs)/,
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name].[hash:5].[ext]',
              limit: 1000,
              outputPath: CONFIG.DIR.IMAGE,
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              disable: process.env.NODE_ENV !== 'production',
              pngquant: {
                quality: '80',
              },
            },
          },
        ],
      },
      {
        test: /\.(eot|woff2|woff|ttf|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: CONFIG.DIR.FONT,
            },
          },
          {
            loader: 'url-loader',
          },
        ],
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              attrs: ['img:src', 'img:data-src', ':data-background'],
            },
          },
        ],
      },
      {
        test: /\.ejs$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              attrs: ['img:src', 'img:data-src', ':data-background'],
            },
          },
          {
            loader: 'ejs-html-loader',
            options: {
              production: process.env.ENV === 'production',
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: 'views/index.ejs',
      template: resolve(__dirname, '../views/index.ejs'),
      chunks: 'index',
    }),
  ],
};
