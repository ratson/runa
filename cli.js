#!/usr/bin/env node
'use strict'

const _ = require('lodash')
const split = require('split')
const debug = require('debug')

const runa = require('.')
const runServer = require('./server')

async function main() {
  const taskManager = await runa()
  const taskNameLen = _.max(_.map(taskManager.tasks, 'name').map(_.size))
  _.map(taskManager.tasks, (task, name) => {
    task
      .start()
      .stdout.pipe(split(null, null, { trailing: false }))
      .on('data', line => {
        debug(name.padEnd(taskNameLen))(line)
      })
  })

  runServer({ taskManager, port: 8008 })
}

main()
