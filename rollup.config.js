export default {
  input: "./lib/index.js",
  output: {
    file: "./dist/redux-typescript-helper.js",
    format: "cjs"
  },
  external: ["redux", "redux-observable", "immer", "rxjs", "rxjs/operators"],
  onwarn(warning, warn) {
    if (warning.code === "THIS_IS_UNDEFINED") {
      return;
    }
    warn(warning);
  }
};
