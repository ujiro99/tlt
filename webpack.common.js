const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

const TailwindCss = require('tailwindcss')
const Autoprefixer = require('autoprefixer')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  entry: {
    'dist/js/popup': path.join(__dirname, 'src/popup/index.tsx'),
    'dist/eventPage': path.join(__dirname, 'src/eventPage.ts'),
  },
  output: {
    path: __dirname,
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { importLoaders: 1 } },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [TailwindCss, Autoprefixer],
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'dist/manifest.json' },
        { from: 'public', to: 'dist/' },
        { from: 'src/popup.html', to: 'dist/popup.html' },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: 'dist/style.css',
    }),
  ],
}
