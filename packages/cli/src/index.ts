import daemon from "@runa/daemon"
import execa from "execa"
import exit from "exit"
import PQueue from "p-queue"
import which from "which"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

const resolveCommand = async (cmd: string) => {
  try {
    return await which(cmd)
  } catch {}

  return false
}

class CommandExecutor {
  #file: string
  #args: string[]
  #cp?: execa.ExecaChildProcess
  #queue = new PQueue({ concurrency: 1 })

  constructor(commandArgs: string[]) {
    this.#file = commandArgs[0]
    this.#args = commandArgs.slice(1)
  }

  async run(): Promise<number> {
    void daemon.registerRestart(() => {
      const p = this.restart()
      void this.#queue.add(async () => p)
    })

    this.#cp = this.spawn()
    await this.#queue.add(async () => this.#cp)
    await this.#queue.onIdle()

    return this.#cp.exitCode ?? 0
  }

  restart() {
    this.#cp?.kill()
    this.#cp = this.spawn()
    return this.#cp
  }

  private spawn() {
    return execa(this.#file, this.#args, {
      stdio: "inherit",
      reject: false,
    })
  }
}

const main = async () => {
  void yargs(hideBin(process.argv))
    .command(
      "$0",
      "execute command",
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
      async (argv) => {
        if (argv._.length === 0) {
          yargs.showHelp()
          return
        }

        const cmd = argv._[0]
        const resolved = await resolveCommand(cmd)
        if (resolved === false) {
          console.log(`Unknown command: ${cmd}`)
          return
        }

        void daemon.notifyProcessStart({
          args: argv._,
          cwd: process.cwd(),
        })

        const exitCode = await new CommandExecutor(argv._).run()

        await daemon.disconnect()
        exit(exitCode)
      },
    )
    .help().argv
}

export default main
