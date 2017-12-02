'use strict'

const { matches } = require('z')
const _ = require('lodash')
const execa = require('execa')
const pkgConf = require('pkg-conf')

class Task {
  constructor({ name, command, spawn }) {
    this.name = name
    this.command = command
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
    this.process = null
  }

  getStatus() {
    return this.process === null ? 'stopped' : 'running'
  }
}

class TaskManager {
  constructor(conf) {
    const execaOpts = { cwd: conf.cwd }
    this.tasks = _.pickBy(
      _.mapValues(conf.tasks, (task, name) =>
        matches(task)(
          (x = String) =>
            new Task({
              name,
              command: task,
              spawn: () => execa.shell(x, execaOpts),
            }),
          (a, tail) =>
            new Task({
              name,
              command: task,
              spawn: () => execa(a, tail, execaOpts),
            }),
          () => null
        )
      )
    )
  }

  getTasks() {
    return _.mapValues(this.tasks, task => ({
      command: task.command,
      status: task.getStatus(),
    }))
  }
}

module.exports = async ({ cwd } = {}) => {
  const conf = await pkgConf('runa', {
    cwd,
    defaults: {
      tasks: {},
    },
  })
  return new TaskManager(conf)
}
