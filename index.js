'use strict'

const { matches } = require('z')
const _ = require('lodash')
const debug = require('debug')
const execa = require('execa')
const pkgConf = require('pkg-conf')

module.exports = async ({ cwd } = {}) => {
  debug.enable('*')
  // eslint-disable-next-line no-console
  debug.log = console.log.bind(console)
  const conf = await pkgConf('runa', {
    cwd,
    defaults: {
      tasks: {},
    },
  })
  const execaOpts = { cwd }
  const processes = _.pickBy(
    _.mapValues(conf.tasks, task =>
      matches(task)(
        (x = String) => execa.shell(x, execaOpts),
        (a, tail) => execa(a, tail, execaOpts),
        () => null
      )
    )
  )
  return processes
}
