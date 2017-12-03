'use strict'

const restify = require('restify')

function runServer({ taskManager, port }) {
  function getStatus(req, res, next) {
    res.send({
      tasks: taskManager.getTasks(),
    })
    next()
  }

  function startTask(req, res, next) {
    try {
      taskManager.startTask(req.params.name)
    } catch (err) {}
    getStatus(req, res, next)
  }

  function stopTask(req, res, next) {
    taskManager.stopTask(req.params.name)
    getStatus(req, res, next)
  }

  const server = restify.createServer()
  server.get('/status', getStatus)
  server.post('/start/:name', startTask)
  server.post('/stop/:name', stopTask)

  server.listen(port, '127.0.0.1', () => {
    // eslint-disable-next-line no-console
    console.log(`${server.name} listening at ${server.url}`)
  })
}

module.exports = runServer
