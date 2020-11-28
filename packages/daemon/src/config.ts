import envPaths from "env-paths"
import ipc from "node-ipc"
import path from "path"

const paths = envPaths("runa")
const dataPath = paths.data
const pidPath = path.join(paths.data, "server.pid")
const socketPath = path.join(dataPath, "server.sock")

const serverId = "server"
ipc.config.silent = true
ipc.config.socketRoot = dataPath + "/"

export { dataPath, pidPath, serverId, socketPath }
