#!/usr/bin/env node
'use strict'

const debug = require('debug')
const opn = require('opn')
const yargs = require('yargs')

const runa = require('.')
const runServer = require('./server')

const CONTROL_C = '03'
const CONTROL_D = '04'
const CONTROL_O = '0f'
const CONTROL_R = '12'

async function main() {
  const { argv } = yargs.option('port', {
    default: 8008,
    type: 'number',
  })

  const { port } = argv

  debug.enable('*')
  // eslint-disable-next-line no-console
  debug.log = console.log.bind(console)

  const taskManager = await runa()
  taskManager.startAllTasks()
  runServer({ taskManager, port })

  const { stdin } = process
  if (typeof stdin.setRawMode === 'function') {
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('hex')
    stdin.on('data', key => {
      if (key === CONTROL_C || key === CONTROL_D) {
        taskManager.stopAllTasks()
        process.exit(0)
      }
      if (key === CONTROL_R) {
        taskManager.stopAllTasks()
        taskManager.startAllTasks()
      }
      if (key === CONTROL_O) {
        const url = `http://127.0.0.1:${port}`
        opn(url).catch(() => {})
      }
    })
  }
}

main()
