const pkg = require("./package.json")

require("@rushstack/eslint-patch/modern-module-resolution")

module.exports = {
  extends: [
    "xo",
    require.resolve("xo/config/plugins"),
    "xo-typescript",
    "prettier",
    "prettier/@typescript-eslint",
    "prettier/unicorn",
  ],
  plugins: ["unicorn"],
  root: true,
  parserOptions: {
    project: ["tsconfig.json", "packages/*/tsconfig.json"],
  },
  rules: {
    ...pkg.xo.rules,
    "unicorn/prevent-abbreviations": "off",
  },
}
