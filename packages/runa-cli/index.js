'use strict'

const Path = require('path')
const sane = require('sane')
const signale = require('signale')
const yargs = require('yargs')

const { default: Runa } = require('runa-core')

async function main() {
  const { argv } = yargs
    .option('watch', {
      alias: 'w',
      type: 'string',
    })
    .version()
    .help()

  if (argv.watch) {
    const runa = Runa.create()
    const watchingTask = runa.registerChildProcess({
      command: ['node', Path.resolve(process.cwd(), argv.watch)],
      stdio: 'inherit',
    })
    watchingTask.on('status-change', ({ task, newStatus }) => {
      signale.info(task.id, newStatus)
    })

    const watcher = sane(process.cwd(), { glob: ['**'] })
    watcher.on('change', async filepath => {
      signale.info(`${filepath} has changed, restarting`)
      await watchingTask.restart()
    })

    await watchingTask.start()
  }
}

module.exports = main
