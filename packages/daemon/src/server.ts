import fse from "fs-extra"
import ipc from "node-ipc"
import pino from "pino"
import onExit from "signal-exit"
import { pidPath, serverId, socketPath } from "./config"
import { Event, ProcessStartData } from "./event"

process.title = serverId
ipc.config.id = serverId

const logger = pino()

const bindEvents = () => {
  ipc.server.on(Event.ProcessStart, (data: ProcessStartData, socket) => {
    logger.info("process started: %o", data)
  })

  ipc.server.on("connect", () => {
    logger.info("connect")
  })
  ipc.server.on("destroy", () => {
    logger.info("destroy")
  })
  ipc.server.on("error", (error) => {
    logger.info("error %o", error)
  })
  ipc.server.on("socket.disconnected", (socket, destroyedSocketID) => {
    logger.info("socket.disconnected %o", destroyedSocketID)
  })
}

const cleanup = () => {
  logger.info("exiting...")
  ipc.server.stop()
  fse.removeSync(pidPath)
}

const main = async () => {
  onExit(cleanup)

  await fse.outputFile(pidPath, process.pid.toString(), {
    mode: 0o700,
  })

  ipc.serve(socketPath, bindEvents)
  ipc.server.start()
}

if (require.main === module) void main()
