const path = require("path");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: "./lib/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "redux-typescript-helper.js",
    library: "redux-typescript-helper",
    libraryTarget: "umd"
  },
  externals: [
    "redux",
    "redux-observable",
    "immer",
    "rxjs",
    "rxjs/operators",
    "reselect"
  ]
};
