import startServer from "@runa/server"
import envPaths from "env-paths"
import fse from "fs-extra"
import path from "path"

const paths = envPaths("runa")
const pidPath = path.join(paths.data, "server.pid")
const socketPath = path.join(paths.data, "server.sock")

export { socketPath }

const main = async () => {
  await fse.outputFile(pidPath, process.pid.toString(), {
    mode: 0o600
  })

  process.on("exit", () => {
    fse.removeSync(pidPath)
  })

  await startServer(socketPath)
}

if (require.main === module) void main()
