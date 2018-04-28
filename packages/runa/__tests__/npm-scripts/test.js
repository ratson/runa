'use strict'

const execa = require('execa')

it('run npm script', async () => {
  const { stdout } = await execa(
    'node',
    [require.resolve('../../cli.js'), 'build'],
    {
      cwd: __dirname,
    }
  )
  expect(stdout).toMatch(/^v[\d]+\.[\d]+/)
})
