const path = require("path");

module.exports = {
  mode: "production",
  entry: "./lib/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "redux-typescript-helper.js",
    library: "redux-typescript-helper",
    libraryTarget: "umd"
  },
  externals: ["redux", "redux-observable", "immer", "rxjs", "rxjs/operators"]
};
