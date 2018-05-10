'use strict'

const restify = require('restify')
const { publicPath } = require('runa-ui-elm')

const pkg = require('./package.json')

const { serveStatic } = restify.plugins

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

  const server = restify.createServer({
    name: pkg.name,
  })
  server.get('/status', getStatus)
  server.post('/start/:name', startTask)
  server.post('/stop/:name', stopTask)
  server.get(
    /\/.*/,
    serveStatic({
      directory: publicPath,
      default: 'index.html',
    }),
  )

  server.listen(port, '127.0.0.1', () => {
    // eslint-disable-next-line no-console
    console.log(`${server.name} listening at ${server.url}`)
  })
}

module.exports = runServer
