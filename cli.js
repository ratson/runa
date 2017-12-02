#!/usr/bin/env node
'use strict'

const _ = require('lodash')
const split = require('split')
const debug = require('debug')

const runa = require('.')

async function main() {
  const { tasks } = await runa()
  const taskNameLen = _.max(_.map(tasks, 'name').map(_.size))

  return _.map(tasks, (task, name) => {
    task
      .start()
      .stdout.pipe(split(null, null, { trailing: false }))
      .on('data', line => {
        debug(name.padEnd(taskNameLen))(line)
      })
  })
}

main()
