'use strict'

const runa = require('../..')

it('can run without error', async () => {
  const { tasks } = await runa({ cwd: __dirname })
  expect(tasks).toEqual({})
})
