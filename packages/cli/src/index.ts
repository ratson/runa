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
      }
    )
    .help().argv
}

export default main
