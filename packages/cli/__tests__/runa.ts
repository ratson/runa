import execa from "execa"

const runa = (...args: string[]) =>
  execa("node", ["../dist/cli.js", ...args], { cwd: __dirname })

test("print usage by default", async () => {
  const res = await runa()
  expect(res.exitCode).toBe(0)
  expect(res.stderr).toMatch(/Show help/)
})

test("--help", async () => {
  const res = await runa("--help")
  expect(res.exitCode).toBe(0)
  expect(res.stdout).toMatchInlineSnapshot(`
    "cli.js

    execute command

    Options:
      --version  Show version number                                       [boolean]
      --help     Show help                                                 [boolean]"
  `)
})
