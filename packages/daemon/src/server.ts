import startServer from "@runa/server"
import envPaths from "env-paths"
import fse from "fs-extra"
import path from "path"
import onExit from "signal-exit"

const paths = envPaths("runa")
const pidPath = path.join(paths.data, "server.pid")
const socketPath = path.join(paths.data, "server.sock")

export { pidPath, socketPath }

const cleanup = () => {
  fse.removeSync(pidPath)
  fse.removeSync(socketPath)
}

const main = async () => {
  onExit(cleanup)

  await fse.outputFile(pidPath, process.pid.toString(), {
    mode: 0o600,
  })

  await fse.remove(socketPath)
  await startServer(socketPath)
}

if (require.main === module) void main()
