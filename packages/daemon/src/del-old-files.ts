import type { Entry } from "fast-glob"
import glob from "fast-glob"
import fsp from "fs/promises"
import ms from "ms"

type Options = {
  age: string | number
  cwd?: string
  patterns?: string | string[]
  depth?: number
}

const delOldFiles = async (options: Options) => {
  const opts = { cwd: process.cwd(), patterns: "**/*", ...options }
  const age = typeof opts.age === "string" ? ms(opts.age) : opts.age
  const now = Date.now()

  for await (const data of glob.stream(opts.patterns, {
    cwd: opts.cwd,
    deep: opts.depth,
    followSymbolicLinks: false,
    absolute: true,
    onlyFiles: true,
    stats: true,
    dot: true,
  })) {
    const entry = (data as unknown) as Entry
    if (!entry.stats) {
      return
    }

    if (now - entry.stats.mtimeMs >= age) {
      await fsp.unlink(entry.path)
    }
  }
}

export default delOldFiles
