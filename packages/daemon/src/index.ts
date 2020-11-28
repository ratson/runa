import { spawn } from "child_process"
import fs from "fs"
import { socketPath } from "./server"

const isDaemonRunning = () => fs.existsSync(socketPath)

const spawnDaemonProcess = async () => {
  if (isDaemonRunning()) {
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
