import test from 'ava'

import execa from 'execa'

test('show version', async t => {
  const { stdout } = await execa('node', ['cli.js', '--version'], {
    cwd: __dirname,
  })
  t.regex(stdout, /\d+\.\d+\.\d+/)
})
