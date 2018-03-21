import path from "path";

export default {
  entry: path.resolve(__dirname, "../fixtures/entry.js"),
  mode: "development",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        loader: "url-loader",
        test: /\.(svg|eot|ttf|woff|woff2)?$/
      },
      {
        loaders: "file-loader?name=i/[hash].[ext]",
        test: /\.(svg|eot|ttf|woff|woff2)?$/
      }
    ]
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "../build")
  },
  plugins: []
};
