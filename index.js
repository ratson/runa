'use strict'

const { matches } = require('z')
const _ = require('lodash')
const execa = require('execa')
const pkgConf = require('pkg-conf')

module.exports = async ({ cwd, quiet = true } = {}) => {
  const conf = await pkgConf('runa', {
    cwd,
    defaults: {
      tasks: [],
    },
  })
  const execaOpts = { cwd, stdio: quiet ? undefined : 'inherit' }
  return _.map(conf.tasks, task =>
    matches(task)(
      (x = String) => execa.shell(x, execaOpts),
      (a, tail) => execa(a, tail, execaOpts),
      () => null
    )
  ).filter(_.isObject)
}
