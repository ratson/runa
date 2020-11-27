import test from 'ava'
import execa from 'execa'

test('run npm script', async t => {
  const { stdout } = await execa(
    'node',
    [require.resolve('../../cli.js'), 'build'],
    {
      cwd: __dirname,
    },
  )
  t.regex(stdout, /^v[\d]+\.[\d]+/)
})
