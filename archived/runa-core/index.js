import assert from 'assert'
import EventEmitter from 'events'

import execa from 'execa'
import nanoid from 'nanoid'

const RUNNING = Symbol('RUNNING')
const STOPPED = Symbol('STOPPED')
const RESTARTING = Symbol('RESTARTING')

class Task extends EventEmitter {
  constructor(raw) {
    super()

    this.id = nanoid()
    this._raw = raw
    this._status = STOPPED
  }

  get status() {
    return this._status === RUNNING ? 'RUNNING' : 'STOPPED'
  }

  async start() {
    await this._raw.start()
    this._updateStatus(RUNNING)
  }

  async stop() {
    await this._raw.stop()
    this._updateStatus(STOPPED)
  }

  async restart() {
    this._updateStatus(RESTARTING)
    if (this._raw.restart) {
      await this._raw.restart()
    } else {
      await this._raw.stop()
      await this._raw.start()
    }
    this._updateStatus(RUNNING)
  }

  _updateStatus(newStatus) {
    if (this._status === newStatus) {
      return
    }
    const oldStatus = this.status
    this._status = newStatus
    this.emit('status-change', {
      task: this,
      oldStatus,
      newStatus: this.status,
    })
  }

  toJSON() {
    return {
      id: this.id,
      status: this.status,
    }
  }
}

class TaskManager {
  constructor({ autoStart = false } = {}) {
    this.autoStart = autoStart
    this._tasks = []
  }

  get tasks() {
    return this._tasks.slice()
  }

  findTask(taskId) {
    return this.tasks.find(({ id }) => id === taskId)
  }

  register(task) {
    const enhancedTask = new Task(task)
    this._tasks.push(enhancedTask)

    if (this.autoStart) {
      enhancedTask.start()
    }

    return enhancedTask
  }

  registerChildProcess({ command, ...opts }) {
    assert(Array.isArray(command) && command.length >= 1)
    return this.register({
      start() {
        this.process = execa(command[0], command.slice(1), {
          killSignal: 'SIGTINT',
          ...opts,
          reject: false,
        })
        return this.process
      },
      stop() {
        return Promise.all([
          this.process,
          (async () => {
            this.process.kill()
          })(),
        ])
      },
    })
  }
}

function create(opts) {
  return new TaskManager(opts)
}

export default { create }
