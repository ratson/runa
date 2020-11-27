require("@rushstack/eslint-patch/modern-module-resolution")

module.exports = {
  extends: [
    "xo",
    "xo-typescript",
    "prettier",
    "prettier/@typescript-eslint",
    "prettier/unicorn",
  ],
  root: true,
  parserOptions: {
    project: ["tsconfig.json", "packages/*/tsconfig.json"],
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx"],
      },
    },
  },
  rules: {},
}
