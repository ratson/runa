import runScript from "@npmcli/run-script"
import daemon from "@runapm/daemon"
import execa from "execa"
import exit from "exit"
import PQueue from "p-queue"
import picomatch from "picomatch"
import readPkg from "read-pkg"
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
    const cmd = this.#file
    const resolved = await resolveCommand(cmd)
    if (resolved === false) {
      console.log(`Unknown command: ${cmd}`)
      return 127
    }

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

class ScriptsExecutor {
  #commandArgs: string[]

  constructor(commandArgs: string[]) {
    this.#commandArgs = commandArgs
  }

  async run() {
    const pkg = await readPkg()

    const cmds = this.#commandArgs
      .map((s) => {
        const isMatch = picomatch(s)
        return Object.keys(pkg.scripts ?? {}).filter((k) => isMatch(k))
      })
      .flat()

    for await (const event of cmds) {
      await runScript({
        event,
        path: process.cwd(),
        stdio: "inherit",
        banner: false,
      })
    }

    return 0
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
    .command(
      "$0",
      "execute command",
      (yargs) =>
        yargs.options({
          s: {
            describe: "Run npm-scripts sequentially",
            type: "boolean",
          },
        }),
      async (argv) => {
        const commandArgs = argv._
        if (commandArgs.length === 0) {
          yargs.showHelp()
          return
        }

        const notifyStartPromise = daemon.notifyProcessStart({
          args: commandArgs,
          cwd: process.cwd(),
        })

        const Executor = argv.s ? ScriptsExecutor : CommandExecutor
        const exitCode = await new Executor(commandArgs).run()

        await notifyStartPromise
        await daemon.notifyProcessEnd()
        await daemon.disconnect()
        exit(exitCode)
      },
    )
    .help().argv
}

export default main
