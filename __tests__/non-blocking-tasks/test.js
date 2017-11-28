'use strict'

const execa = require('execa')

const runa = require('../..')

it('can run tasks', async () => {
  const processes = await runa({ cwd: __dirname })
  expect(processes).toHaveLength(2)

  const reuslts = await Promise.all(processes)
  expect(reuslts).toEqual([
    expect.objectContaining({
      code: 0,
      stdout: expect.stringMatching(/v\d+\.\d+\.\d+/),
    }),
    expect.objectContaining({
      code: 0,
      stdout: expect.stringMatching(/\d+\.\d+\.\d+/),
    }),
  ])
})

it('can run from cli', async () => {
  const { stdout } = await execa('node', [require.resolve('../../cli.js')], {
    cwd: __dirname,
  })
  expect(stdout).toMatch(/v.+/)
})
