import test from 'ava'

import runa from '../..'

test('can run without error', async t => {
  const { tasks } = await runa({ cwd: __dirname })
  t.deepEqual(tasks, {})
})
