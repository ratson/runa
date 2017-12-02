'use strict'

const { matches } = require('z')
const _ = require('lodash')
const debug = require('debug')
const execa = require('execa')
const pkgConf = require('pkg-conf')

class Task {
  constructor({ name, spawn }) {
    this.name = name
    this.spawn = spawn
    this.process = null
  }

  start() {
    if (this.process !== null) {
      throw new Error(`${this.name} is already started`)
    }
    this.process = this.spawn()
    return this.process
  }

  stop() {
    this.process.kill()
  }
}

class TaskManager {
  constructor(conf) {
    const execaOpts = { cwd: conf.cwd }
    this.tasks = _.pickBy(
      _.mapValues(conf.tasks, (task, name) =>
        matches(task)(
          (x = String) =>
            new Task({ name, spawn: () => execa.shell(x, execaOpts) }),
          (a, tail) =>
            new Task({ name, spawn: () => execa(a, tail, execaOpts) }),
          () => null
        )
      )
    )
  }
}

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
  return new TaskManager(conf)
}
