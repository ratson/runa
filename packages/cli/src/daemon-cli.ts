#!/usr/bin/env node
import daemon from "@runa/daemon"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

const main = async () => {
  void yargs(hideBin(process.argv))
    .command("shutdown", "shutdown daemon process", async () => {
      await daemon.shutdown()
      console.log("shutdown daemon")
    })
    .help().argv
}

if (require.main === module) void main()
