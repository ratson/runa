import assert from "assert"
import cp from "child_process"
import delay from "delay"
import fse from "fs-extra"
import isRunning from "is-running"
import ipc from "node-ipc"
import { logDir, pidPath, serverId, socketPath } from "./config"
import { Event, EventType } from "./event"

export * from "./event"

class Daemon {
  #pid?: number
  #server?: typeof ipc.server
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

  async notifyProcessStart() {
    await this.emit({ type: EventType.ProcessStart, pid: process.pid })
  }

  async shutdown() {
    if (await this.isRunning()) {
      process.kill(this.#pid!)
    }
  }

  private async emit(event: Event) {
    await this.init()
    this.#server!.emit(event.type, event)
  }

  private assertReady() {
    assert(this.#pid, "pid is missing, call init() first")
  }

  private async spawn() {
    if (await this.isRunning()) {
      return
    }

    await this.spawnServer()
    this.#server = await this.connect()
    await this.waitServerReady()
  }

  private async connect(): Promise<typeof ipc.server> {
    return new Promise((resolve) => {
      ipc.connectTo(serverId, socketPath, () => {
        resolve(ipc.of[serverId])
      })
    })
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
