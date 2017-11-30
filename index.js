'use strict'

const { matches } = require('z')
const _ = require('lodash')
const debug = require('debug')
const execa = require('execa')
const pkgConf = require('pkg-conf')
const split = require('split')

module.exports = async ({ cwd, quiet = true } = {}) => {
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
  const taskNameLen = _.max(Object.keys(conf.tasks).map(_.size))
  const processes = _.pickBy(
    _.mapValues(conf.tasks, task =>
      matches(task)(
        (x = String) => execa.shell(x, execaOpts),
        (a, tail) => execa(a, tail, execaOpts),
        () => null
      )
    )
  )
  if (quiet) {
    return processes
  }
  return _.map(processes, (child, name) => {
    child.stdout
      .pipe(split(null, null, { trailing: false }))
      .on('data', line => {
        debug(name.padEnd(taskNameLen))(line)
      })
  })
}
