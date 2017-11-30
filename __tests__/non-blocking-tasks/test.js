'use strict'

const _ = require('lodash')
const execa = require('execa')

const runa = require('../..')

it('can run tasks', async () => {
  const processes = await runa({ cwd: __dirname })
  expect(_.size(processes)).toBe(2)

  expect(await processes['node-version']).toEqual(
    expect.objectContaining({
      code: 0,
      stdout: expect.stringMatching(/v\d+\.\d+\.\d+/),
    })
  )
  expect(await processes['npm-version']).toEqual(
    expect.objectContaining({
      code: 0,
      stdout: expect.stringMatching(/\d+\.\d+\.\d+/),
    })
  )
})

it('can run from cli', async () => {
  const { stdout } = await execa('node', [require.resolve('../../cli.js')], {
    cwd: __dirname,
  })
  expect(stdout).toMatch(/v.+/)
})
