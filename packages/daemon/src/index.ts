import assert from "assert"
import cp from "child_process"
import delay from "delay"
import fse from "fs-extra"
import isRunning from "is-running"
import ipc from "node-ipc"
import { logDir, pidPath, serverId, socketPath } from "./config"

export * from "./event"

class Daemon {
  #pid?: number
  #spawnPromise?: Promise<void>

  get pid(): number {
    this.assertReady()
    return this.#pid!
  }

  async init() {
    if (!this.#spawnPromise) {
      this.#spawnPromise = this.spawn()
    }

    return this.#spawnPromise
  }

  async connect(): Promise<typeof ipc.server> {
    await this.init()

    return new Promise((resolve) => {
      ipc.connectTo(serverId, socketPath, () => {
        resolve(ipc.of[serverId])
      })
    })
  }

  async shutdown() {
    if (await this.isRunning()) {
      process.kill(this.#pid!)
    }
  }

  private assertReady() {
    assert(this.#pid, "pid is missing, call init() first")
  }

  private async spawn() {
    if (await this.isRunning()) {
      return
    }

    await this.spawnServer()
    await this.waitServerReady()
  }

  private async waitServerReady(): Promise<void> {
    if (await this.isRunning()) {
      return
    }

    await delay(100)
    return this.waitServerReady()
  }

  private async isRunning() {
    try {
      const pid = await this.readPID()
      if (isRunning(pid)) {
        this.#pid = pid
        return true
      }
    } catch {}

    return false
  }

  private async readPID() {
    const pid = await fse.readFile(pidPath, "utf-8")
    return Number.parseInt(pid, 10)
  }

  private async spawnServer() {
    await fse.ensureDir(logDir(), { mode: 0o700 })

    const subprocess = cp.fork(require.resolve("../dist/server.js"), {
      detached: true,
      stdio: [
        "ignore",
        fse.openSync(logDir("server.stdout.log"), "a"),
        fse.openSync(logDir("server.stderr.log"), "a"),
        "ipc",
      ],
    })
    subprocess.unref()
  }
}

export default new Daemon()
