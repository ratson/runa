import test from 'ava'

import execa from 'execa'

test('show help', async t => {
  const { stdout } = await execa('./cli.js', ['--help'], { cwd: __dirname })
  t.regex(stdout, /--help/)
  t.regex(stdout, /--port[^\n]+default: 8008/)
})

test('show version', async t => {
  const { stdout } = await execa('./cli.js', ['--version'], { cwd: __dirname })
  t.regex(stdout, /\d+\.\d+\.\d+/)
})

test('fail for missing script', async t => {
  const { code, stderr } = await execa('./cli.js', ['missing-script'], {
    cwd: __dirname,
    reject: false,
  })
  t.is(code, 1)
  t.regex(stderr, /missing-script/)
})
