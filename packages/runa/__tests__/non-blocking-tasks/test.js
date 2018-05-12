import test from 'ava'
import _ from 'lodash'
import execa from 'execa'

import runa from '../..'

test('can run tasks', async t => {
  const { tasks } = await runa({ cwd: __dirname })
  t.is(_.size(tasks), 2)

  const nodeVersion = await tasks['node-version'].start()
  t.is(nodeVersion.code, 0)
  t.regex(nodeVersion.stdout, /v\d+\.\d+\.\d+/)

  const npmVersion = await tasks['npm-version'].start()
  t.is(npmVersion.code, 0)
  t.regex(npmVersion.stdout, /\d+\.\d+\.\d+/)
})

test('can run from cli', async t => {
  const p = execa('node', [require.resolve('../../cli.js')], {
    cwd: __dirname,
  })
  p.stdout.on('data', data => {
    if (data.toString().indexOf('npm-version')) {
      p.kill()
    }
  })
  const { stdout } = await p.catch(err => err)
  t.regex(stdout, /v.+/)
})
