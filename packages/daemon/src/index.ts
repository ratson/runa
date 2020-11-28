import { spawn } from "child_process"
import fs from "fs"
import fsp from "fs/promises"
import fse from "fs-extra"
import isRunning from "is-running"
import { pidPath, socketPath } from "./server"

const isDaemonRunning = async () => {
  try {
    const pid = await fsp.readFile(pidPath, "utf-8")
    return isRunning(Number.parseInt(pid, 10))
  } catch {}

  return false
}

const spawnDaemonProcess = async () => {
  if (await isDaemonRunning()) {
    return false
  }

  const subprocess = spawn(
    process.argv[0],
    [require.resolve("../dist/server.js")],
    {
      detached: true,
      stdio: "ignore",
    }
  )

  await new Promise((resolve) => {
    setTimeout(resolve, 1000)
  })

  subprocess.unref()

  return true
}

export { socketPath }

export default spawnDaemonProcess
