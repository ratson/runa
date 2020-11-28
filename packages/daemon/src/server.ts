import fse from "fs-extra"
import ipc from "node-ipc"
import onExit from "signal-exit"
import { pidPath, serverId, socketPath } from "./config"
import { Event, ProcessStartData } from "./event"

ipc.config.id = serverId

const bindEvents = () => {
  ipc.server.on(Event.ProcessStart, (data: ProcessStartData, socket) => {
    console.log("process started", data.pid)
  })
}

const cleanup = () => {
  fse.removeSync(pidPath)
  fse.removeSync(socketPath)
}

const main = async () => {
  onExit(cleanup)

  await fse.outputFile(pidPath, process.pid.toString(), {
    mode: 0o600,
  })

  ipc.serve(socketPath, bindEvents)
  ipc.server.start()
}

if (require.main === module) void main()
