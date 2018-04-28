'use strict'

const { matches } = require('z')
const _ = require('lodash')
const debug = require('debug')
const execa = require('execa')
const pkgConf = require('pkg-conf')
const split = require('split')

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
    const p = this.process
    if (p === null) {
      return p
    }
    this.process = null
    p.catch(_.noop)
    p.kill()
    return p
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
    return Object.values(this.tasks).map(task => ({
      name: task.name,
      command: task.command,
      status: task.getStatus(),
    }))
  }

  async startTask(name) {
    const task = this.tasks[name]
    if (!task) {
      return null
    }
    const taskNameLen = _.max(_.map(this.tasks, 'name').map(_.size))
    try {
      const p = task.start()
      p.stdout.pipe(split(null, null, { trailing: false })).on('data', line => {
        debug(name.padEnd(taskNameLen))(line)
      })
      p.stderr.pipe(split(null, null, { trailing: false })).on('data', line => {
        debug(name.padEnd(taskNameLen))(line)
      })
      return p
    } catch (err) {
      return null
    }
  }

  stopTask(name) {
    const task = this.tasks[name]
    if (!task) {
      return
    }
    task.stop()
  }

  startAllTasks() {
    return Object.keys(this.tasks).map(name => this.startTask(name))
  }

  stopAllTasks() {
    return Object.keys(this.tasks).map(name => this.stopTask(name))
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
