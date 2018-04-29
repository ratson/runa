import makeDebug from 'debug'
import restify from 'restify'

import pkg from './package.json'

export function createServer({ taskManager }) {
  function getStatus(req, res, next) {
    res.send({ tasks: taskManager.tasks })
    next()
  }

  const createTaskHandler = action => async (req, res, next) => {
    const task = taskManager.findTask(req.params.taskId)
    if (task) {
      await task[action]()
    }
    getStatus(req, res, next)
  }

  const server = restify.createServer({ name: pkg.name })
  server.get('/status', getStatus)
  server.post('/start/:taskId', createTaskHandler('start'))
  server.post('/stop/:taskId', createTaskHandler('stop'))
  server.post('/restart/:taskId', createTaskHandler('restart'))

  return server
}

export default ({ taskManager, port }) => {
  const debug = makeDebug(pkg.name)

  const server = createServer({ taskManager })

  server.listen(port, '127.0.0.1', () => {
    debug(`${server.name} listening at ${server.url}`)
  })

  return server
}
