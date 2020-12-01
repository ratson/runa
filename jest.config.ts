import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/archived/", "\\.yarn/"],
}

export default config
