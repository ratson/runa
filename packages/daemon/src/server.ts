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
    logger.info("process started: %o", data.pid)
  })
}

const cleanup = () => {
  logger.info("exiting...")
  fse.removeSync(pidPath)
  fse.removeSync(socketPath)
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
