import { normalizeArgv } from "../src"

test("with arguments", () => {
  expect(normalizeArgv(["node", "cli.js"], "node")).toEqual(["node", "cli.js"])
})

test("with command", () => {
  expect(normalizeArgv(["node", "cli.js", "node"], "node")).toEqual([
    "node",
    "cli.js",
    "--",
    "node",
  ])
})

test("with --flag", () => {
  expect(normalizeArgv(["node", "cli.js", "--flag", "node"], "node")).toEqual([
    "node",
    "cli.js",
    "--flag",
    "--",
    "node",
  ])
})

test("with --", () => {
  expect(normalizeArgv(["node", "cli.js", "--", "node"], "node")).toEqual([
    "node",
    "cli.js",
    "--",
    "node",
  ])
})

test("with -- at command", () => {
  expect(
    normalizeArgv(
      ["node", "cli.js", "--flag", "--", "node", "--", "--version"],
      "node",
    ),
  ).toEqual(["node", "cli.js", "--flag", "--", "node", "--", "--version"])
})
