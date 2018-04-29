import test from 'ava'
import request from 'supertest'
import sinon from 'sinon'

import Runa from 'runa-core'
import { createServer } from '.'

test.beforeEach(t => {
  const taskManager = Runa.create()

  t.context.taskManager = taskManager
  t.context.server = request(createServer({ taskManager }))
})

test('get status', async t => {
  const { server } = t.context
  const res = await server.get('/status')

  t.is(res.status, 200)
  t.deepEqual(res.body, { tasks: [] })
})

test('change task status', async t => {
  const { taskManager, server } = t.context
  const taskStub = {
    start: sinon.spy(),
    stop: sinon.spy(),
    restart: sinon.spy(),
  }
  taskManager.register(taskStub)
  const task = taskManager.tasks[0]

  t.is(taskStub.start.callCount, 0)
  t.is(taskStub.stop.callCount, 0)
  t.is(taskStub.restart.callCount, 0)

  const resStart = await server.post(`/start/${task.id}`)
  t.is(resStart.status, 200)
  t.is(resStart.body.tasks[0].status, 'RUNNING')
  t.is(taskStub.start.callCount, 1)
  t.is(taskStub.stop.callCount, 0)
  t.is(taskStub.restart.callCount, 0)

  const resStop = await server.post(`/stop/${task.id}`)
  t.is(resStop.status, 200)
  t.is(resStop.body.tasks[0].status, 'STOPPED')
  t.is(taskStub.start.callCount, 1)
  t.is(taskStub.stop.callCount, 1)
  t.is(taskStub.restart.callCount, 0)

  const resRestart = await server.post(`/restart/${task.id}`)
  t.is(resRestart.status, 200)
  t.is(resRestart.body.tasks[0].status, 'RUNNING')
  t.is(taskStub.start.callCount, 1)
  t.is(taskStub.stop.callCount, 1)
  t.is(taskStub.restart.callCount, 1)
})
