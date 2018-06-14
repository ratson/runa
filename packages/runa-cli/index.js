'use strict'

const Path = require('path')
const keypress = require('keypress')
const readPkg = require('read-pkg')
const sane = require('sane')
const signale = require('signale')
const yargs = require('yargs')

const { default: Runa } = require('runa-core')

async function main() {
  const { argv } = yargs
    .usage('$0 [command]')
    .option('watch', {
      alias: 'w',
      type: 'string',
    })
    .version()
    .help()
  const [command] = argv._

  const runa = Runa.create()

  if (command) {
    const { scripts } = await readPkg()
    if (!scripts || !scripts[command]) {
      signale.error(`Command "${command}" not found.`)
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1)
    }
    const task = runa.registerChildProcess({
      command: scripts[command],
      stdio: 'inherit',
    })
    await task.start()
  } else if (argv.watch) {
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
    signale.info('press r to restart script')

    await watchingTask.start()
  }
}

module.exports = main
