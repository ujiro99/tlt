const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");


module.exports = {
  entry: {
    "dist/js/popup": path.join(__dirname, "src/popup/index.tsx"),
    "dist/eventPage": path.join(__dirname, "src/eventPage.ts")
  },
  output: {
    path: __dirname,
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: "ts-loader"
      },
      {
        exclude: /node_modules/,
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader" // Creates style nodes from JS strings
          },
          {
            loader: "css-loader" // Translates CSS into CommonJS
          },
          {
            loader: "sass-loader" // Compiles Sass to CSS
          }
        ]
      }
    ]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    extensions: [".ts", ".tsx", ".js"]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "manifest.json", to: "dist/manifest.json" },
        { from: "public", to: "dist/" },
        { from: "src/popup.html", to: "dist/popup.html" },
      ],
    }),
  ],
};
