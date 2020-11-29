import daemon, { Event } from "@runa/daemon"
import execa from "execa"
import exit from "exit"
import which from "which"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

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
        try {
          await which(cmd)
        } catch {
          console.error(`Unknown command: ${cmd}`)
          return
        }

        const p = execa(cmd, argv._.slice(1), {
          stdio: "inherit",
          reject: false,
        })

        const server = await daemon.connect()
        server.emit(Event.ProcessStart, { pid: process.pid })

        try {
          await p
        } catch {
          console.log("failed")
        } finally {
          exit(p.exitCode ?? 0)
        }
      },
    )
    .help().argv
}

export default main
