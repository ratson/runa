import assert from "assert"
import cp from "child_process"
import delay from "delay"
import fse from "fs-extra"
import fsp from "fs/promises"
import isRunning from "is-running"
import path from "path"
import tempy from "tempy"
import { pidPath, socketPath } from "./server"

class Daemon {
  #pid?: number
  #serverPath?: string
  #spawnPromise?: Promise<void>

  get pid(): number {
    this.assertReady()
    return this.#pid!
  }

  url(pathname: string): string {
    this.assertReady()
    return `http:/unix:${this.#serverPath!}:${pathname}`
  }

  async init() {
    if (!this.#spawnPromise) {
      this.#spawnPromise = this.spawn()
    }

    return this.#spawnPromise
  }

  private assertReady() {
    assert(this.#pid, "pid is missing, call init() first")
    assert(this.#serverPath, "serverPath is missing, call init() first")
  }

  private async spawn() {
    if (!(await this.isRunning())) {
      this.spawnServer()
      await this.waitServerReady()
    }

    if (socketPath === encodeURIComponent(socketPath)) {
      this.#serverPath = socketPath
    } else {
      const serverPath = path.join(tempy.directory(), "server.sock")
      await fse.ensureSymlink(socketPath, serverPath)
      this.#serverPath = serverPath
    }
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
    const pid = await fsp.readFile(pidPath, "utf-8")
    return Number.parseInt(pid, 10)
  }

  private spawnServer() {
    const subprocess = cp.fork(require.resolve("../dist/server.js"), {
      detached: true,
      stdio: "ignore",
    })
    subprocess.unref()
  }
}

export default new Daemon()
