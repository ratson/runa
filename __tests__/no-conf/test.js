'use strict'

const runa = require('../..')

it('can run without error', async () => {
  const processes = await runa({ cwd: __dirname })
  expect(processes).toHaveLength(0)
})
