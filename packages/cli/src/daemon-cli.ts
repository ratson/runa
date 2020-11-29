#!/usr/bin/env node
import daemon from "@runa/daemon"
import Table from "cli-table3"
import { prompt } from "enquirer"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

const main = async () => {
  void yargs(hideBin(process.argv))
    .command("list", "list running processes", async () => {
      const processes = await daemon.getProcessList()

      const table = new Table({ head: ["PID", "Command", "Working Directory"] })
      table.push(
        ...processes.map(({ pid, command: c }) => [
          pid,
          c.args.join(" "),
          c.cwd,
        ]),
      )
      console.log(table.toString())

      await daemon.disconnect()
    })
    .command("restart", "restart command processes", async () => {
      const processes = await daemon.getProcessList()

      if (processes.length === 0) {
        console.log("No active processes")
      } else {
        const answers = await prompt<{ pids: string[] }>([
          {
            type: "multiselect",
            name: "pids",
            message: "Select process to be restarted",
            choices: processes.map((o) => ({
              name: `${o.pid}: ${o.command.args.join(" ")}`,
              value: o.pid.toString(),
            })),
          },
        ]).catch(() => ({ pids: [] as string[] }))

        if (answers.pids.length > 0) {
          await daemon.restartProcesses(
            answers.pids.map((x) => Number.parseInt(x, 10)),
          )
        }
      }

      await daemon.disconnect()
    })
    .command("shutdown", "shutdown daemon process", async () => {
      await daemon.shutdown()
      console.log("shutdown daemon")
    })
    .help().argv
}

if (require.main === module) void main()
