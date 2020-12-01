import daemon from "@runapm/daemon"
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

export const normalizeArgv = (
  argv: typeof process.argv,
  argv0: typeof process.argv0,
) => {
  let i = argv.findIndex((s) => s === argv0) + 2
  while (i < argv.length) {
    if (argv[i] === "--") {
      return argv
    }

    if (argv[i].startsWith("-")) {
      i += 1
    } else {
      break
    }
  }

  if (i === argv.length) {
    return argv
  }

  const argvNew = [...argv]
  argvNew.splice(i, 0, "--")
  return argvNew
}

const main = async () => {
  void yargs(hideBin(normalizeArgv(process.argv, process.argv0)))
    .command("$0", "execute command", {}, async (argv) => {
      const commandArgs = argv._
      if (commandArgs.length === 0) {
        yargs.showHelp()
        return
      }

      const cmd = commandArgs[0]
      const resolved = await resolveCommand(cmd)
      if (resolved === false) {
        console.log(`Unknown command: ${cmd}`)
        return
      }

      void daemon.notifyProcessStart({
        args: commandArgs,
        cwd: process.cwd(),
      })

      const exitCode = await new CommandExecutor(commandArgs).run()

      await daemon.notifyProcessEnd()
      await daemon.disconnect()
      exit(exitCode)
    })
    .help().argv
}

export default main
