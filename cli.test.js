'use strict'

const execa = require('execa')

it('show help', async () => {
  const { stdout } = await execa('./cli.js', ['--help'], { cwd: __dirname })
  expect(stdout).toMatch(/--help/)
  expect(stdout).toMatch(/--port[^\n]+default: 8008/)
})

it('show version', async () => {
  const { stdout } = await execa('./cli.js', ['--version'], { cwd: __dirname })
  expect(stdout).toMatch(/\d+\.\d+\.\d+/)
})
