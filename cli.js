#!/usr/bin/env node
'use strict'

const debug = require('debug')
const execa = require('execa')
const opn = require('opn')
const yargs = require('yargs')
const readPkg = require('read-pkg')

const runa = require('.')
const runServer = require('./server')

const CONTROL_C = '03'
const CONTROL_D = '04'
const CONTROL_O = '0f'
const CONTROL_R = '12'

async function main() {
  const { argv } = yargs.usage('$0 [command]').option('port', {
    default: 8008,
    type: 'number',
  })

  const { port } = argv
  const [command] = argv._

  if (command) {
    const { scripts } = await readPkg()
    if (!scripts || !scripts[command]) {
      // eslint-disable-next-line no-console
      console.error(`Command "${command}" not found.`)
      process.exit(1)
    }
    await execa.shell(scripts[command], {
      stdio: 'inherit',
    })
    return
  }

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
