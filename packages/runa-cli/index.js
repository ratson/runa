'use strict'

const Path = require('path')
const keypress = require('keypress')
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

    keypress(process.stdin)
    const keys = {
      'ctrl-c': '\u0003',
    }
    process.stdin.on('keypress', async (ch, key) => {
      if (!key) {
        return
      }

      if (key.name === 'return') {
        signale.info('press r to restart script')
        return
      }

      if (key.name === 'r') {
        await watchingTask.restart()
        return
      }

      if (key.sequence === keys['ctrl-c'] || key.name === 'q') {
        watcher.close()
        process.stdin.setRawMode(false)
        process.stdin.pause()
        process.stdout.write('\n')
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit()
      }
    })
    process.stdin.setRawMode(true)
    process.stdin.resume()

    await watchingTask.start()
  }
}

module.exports = main
