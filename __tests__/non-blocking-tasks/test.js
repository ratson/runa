'use strict'

const _ = require('lodash')
const execa = require('execa')

const runa = require('../..')

it('can run tasks', async () => {
  const { tasks } = await runa({ cwd: __dirname })
  expect(_.size(tasks)).toBe(2)

  expect(await tasks['node-version'].start()).toEqual(
    expect.objectContaining({
      code: 0,
      stdout: expect.stringMatching(/v\d+\.\d+\.\d+/),
    })
  )
  expect(await tasks['npm-version'].start()).toEqual(
    expect.objectContaining({
      code: 0,
      stdout: expect.stringMatching(/\d+\.\d+\.\d+/),
    })
  )
})

it('can run from cli', async () => {
  const p = execa('node', [require.resolve('../../cli.js')], {
    cwd: __dirname,
  })
  setTimeout(() => {
    p.kill()
  }, 1000)
  const { stdout } = await p.catch(err => err)
  expect(stdout).toMatch(/v.+/)
})
