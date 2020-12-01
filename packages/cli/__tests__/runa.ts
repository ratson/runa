import execa from "execa"

const runa = (...args: string[]) =>
  execa("node", ["../dist/cli.js", ...args], { cwd: __dirname })

test("print usage by default", async () => {
  const res = await runa()
  expect(res.exitCode).toBe(0)
  expect(res.stderr).toMatch(/--help/)
})
