import { Except } from "type-fest"
import fse from "fs-extra"
import ipc from "node-ipc"
import pino from "pino"
import onExit from "signal-exit"
import { pidPath, serverID, socketPath } from "./config"
import { EventType, ProcessStartEvent } from "./event"

process.title = serverID
ipc.config.id = serverID

const logger = pino()
const processes: number[] = []

const bindEvents = () => {
  ipc.server.on(EventType.ProcessStart, (data: ProcessStartEvent, socket) => {
    logger.info("process started: %o", data)
    processes.push(data.pid)
  })

  ipc.server.on(EventType.GetProcessList, (data, socket) => {
    logger.info("processes: %o", data)
    ipc.server.emit(socket, EventType.GetProcessList, processes)
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
