#!/usr/bin/env node
'use strict'

const _ = require('lodash')
const split = require('split')
const debug = require('debug')

const runa = require('.')

async function main() {
  const processes = await runa()
  const taskNameLen = _.max(Object.keys(processes).map(_.size))

  return _.map(processes, (child, name) => {
    child.stdout
      .pipe(split(null, null, { trailing: false }))
      .on('data', line => {
        debug(name.padEnd(taskNameLen))(line)
      })
  })
}

main()
