#!/usr/bin/env node
'use strict'

const _ = require('lodash')
const split = require('split')
const debug = require('debug')

const runa = require('.')
const runServer = require('./server')

const CONTROL_C = '03'
const CONTROL_D = '04'
const CONTROL_R = '12'

function startAllTask(taskManager) {
  const taskNameLen = _.max(_.map(taskManager.tasks, 'name').map(_.size))
  _.map(taskManager.tasks, (task, name) => {
    task
      .start()
      .stdout.pipe(split(null, null, { trailing: false }))
      .on('data', line => {
        debug(name.padEnd(taskNameLen))(line)
      })
  })
}

function stopAllTasks(taskManager) {
  _.map(taskManager.tasks, task => task.stop())
}

async function main() {
  debug.enable('*')
  // eslint-disable-next-line no-console
  debug.log = console.log.bind(console)

  const taskManager = await runa()
  startAllTask(taskManager)
  runServer({ taskManager, port: 8008 })

  const { stdin } = process
  if (typeof stdin.setRawMode === 'function') {
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('hex')
    stdin.on('data', key => {
      if (key === CONTROL_C || key === CONTROL_D) {
        process.exit(0)
      }
      if (key === CONTROL_R) {
        stopAllTasks(taskManager)
        startAllTask(taskManager)
      }
    })
  }
}

main()
