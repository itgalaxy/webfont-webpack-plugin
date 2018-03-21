import path from "path";

export default {
  entry: path.resolve(__dirname, "../fixtures/entry.js"),
  mode: "development",
  module: {
    rules: [
      {
        use: ["style-loader", "css-loader"],
        test: /\.css$/
      },
      {
        use: ["style-loader", "css-loader", "sass-loader"],
        test: /\.scss$/
      },
      {
        loader: "url",
        test: /\.(svg|eot|ttf|woff|woff2)?$/
      },
      {
        loaders: "file?name=i/[hash].[ext]",
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
