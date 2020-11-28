import fastify from "fastify"

const startServer = async (port: number | string) => {
  const server = fastify()

  server.get("/ping", async (request, reply) => {
    return "pong\n"
  })

  server.get("/exit", async (request, reply) => {
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit()
  })

  server.listen(port, (err, address) => {
    if (err) {
      console.error(err)
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1)
    }

    console.log(`Server listening at ${address}`)
  })
}

export default startServer
