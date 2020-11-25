import test from 'ava'
import glob from 'fast-glob'
import Bluebird from 'bluebird'
import execa from 'execa'

test('can require packages', async (t) => {
  await Bluebird.map(
    glob('packages/runa-core', {onlyDirectories: true}),
    async (cwd) => {
      await execa('node', ['-e', "require('.')"], {cwd})
    }
  )
  t.pass()
})
