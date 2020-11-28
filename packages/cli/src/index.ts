import startDaemon, { socketPath } from "@runa/daemon"
import fse from "fs-extra"
import got from "got"
import path from "path"
import tempy from "tempy"
import yargs from "yargs"
// @ts-expect-error
import { hideBin } from "yargs/helpers"

const main = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  yargs(hideBin(process.argv))
    .command(
      "$0",
      "execute command",
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
      async (argv) => {
        console.log("this command will be run by default", argv)
        await startDaemon()

        let serverPath = socketPath
        if (socketPath !== encodeURIComponent(socketPath)) {
          serverPath = path.join(tempy.directory(), "server.sock")
          await fse.ensureSymlink(socketPath, serverPath)
        }

        const respond = await got(`unix:${serverPath}:/ping`)

        console.log(respond.body)
      }
    )
    .help().argv
}

export default main
