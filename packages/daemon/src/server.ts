import fse from "fs-extra"
import isRunning from "is-running"
import _ from "lodash"
import { Socket } from "net"
import ipc from "node-ipc"
import pino from "pino"
import onExit from "signal-exit"
import { pidPath, serverID, socketPath } from "./config"
import {
  EventType,
  ManagedProcessData,
  ProcessEndEvent,
  ProcessStartEvent,
  RestartProcessesEvent,
} from "./event"

process.title = serverID
ipc.config.id = serverID

const logger = pino()
const processes: ManagedProcess[] = []

class ManagedProcess {
  #data: ProcessStartEvent
  #socket: Socket

  constructor(data: ProcessStartEvent, socket: Socket) {
    this.#data = data
    this.#socket = socket
  }

  get pid() {
    return this.#data.pid
  }

  toData(): ManagedProcessData {
    return this.#data
  }

  restart() {
    ipc.server.emit(this.#socket, EventType.RestartProcesses, {
      pids: [this.#data.pid],
    })
  }
}

const removeDeadProcesses = () => {
  _.remove(processes, (p) => !isRunning(p.pid))
}

const bindEvents = () => {
  ipc.server.on(EventType.ProcessStart, (data: ProcessStartEvent, socket) => {
    logger.info("event: %o", data)
    processes.push(new ManagedProcess(data, socket))
  })

  ipc.server.on(EventType.ProcessEnd, (data: ProcessEndEvent, socket) => {
    logger.info("event: %o", data)
    _.remove(processes, (p) => p.pid === data.pid)
  })

  ipc.server.on(EventType.GetProcessList, (data, socket) => {
    logger.info("event: %o", data)
    removeDeadProcesses()
    ipc.server.emit(
      socket,
      EventType.GetProcessList,
      processes.map((o) => o.toData()),
    )
  })

  ipc.server.on(EventType.RestartProcesses, (data: RestartProcessesEvent) => {
    logger.info("event: %o", data)
    processes.filter((o) => data.pids.includes(o.pid)).map((p) => p.restart())
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

const idleTimeout = 1000 * 60 * 30
const stopOnIdle = () => {
  logger.info("idle check %s", processes.length)
  removeDeadProcesses()

  if (processes.length === 0) {
    logger.info("stop on idle")
    ipc.server.stop()
  } else {
    setTimeout(stopOnIdle, idleTimeout)
  }
}

const main = async () => {
  onExit(cleanup)

  await fse.outputFile(pidPath, process.pid.toString(), {
    mode: 0o700,
  })

  ipc.serve(socketPath, bindEvents)
  ipc.server.start()
  setTimeout(stopOnIdle, idleTimeout)
}

if (require.main === module) void main()
