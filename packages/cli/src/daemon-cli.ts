#!/usr/bin/env node
import daemon from "@runa/daemon"
import Table from "cli-table3"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

const main = async () => {
  void yargs(hideBin(process.argv))
    .command("list", "list running processes", async () => {
      const processes = await daemon.getProcessList()
      const verbose = false

      const table = new Table({ head: ["PID", "Command", "Working Directory"] })
      table.push(
        ...processes.map(({ pid, command: c }) => [
          pid,
          verbose ? `${c.args.join(" ")} (${c.pid})` : c.args.join(" "),
          c.cwd,
        ]),
      )
      console.log(table.toString())

      await daemon.disconnect()
    })
    .command("shutdown", "shutdown daemon process", async () => {
      await daemon.shutdown()
      console.log("shutdown daemon")
    })
    .help().argv
}

if (require.main === module) void main()
