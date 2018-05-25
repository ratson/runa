import test from 'ava'

import Runa from './main'

test('register()', async t => {
  const runa = Runa.create()
  t.is(runa.tasks.length, 0)

  const task = runa.register({ start() {} })
  const { tasks } = runa
  t.is(tasks.length, 1)
  t.is(task, tasks[0])
  t.is(task.status, 'STOPPED')

  await task.start()
  // memorized task status is updated
  t.is(task.status, 'RUNNING')
  t.is(runa.tasks[0].status, 'RUNNING')
})

test('registerChildProcess()', async t => {
  const runa = Runa.create({ autoStart: true })

  const task = runa.registerChildProcess({ command: ['sleep', 10] })
  t.is(task, runa.tasks[0])

  await task.stop()
  t.is(task.status, 'STOPPED')
})

test('can not mutate task list', t => {
  const runa = Runa.create()
  t.is(runa.tasks.length, 0)

  runa.tasks.push({})
  t.is(runa.tasks.length, 0)
})

test('registerChildProcess() require command is array with at least one element', t => {
  const runa = Runa.create()

  t.throws(() => runa.registerChildProcess({}))
  t.throws(() => runa.registerChildProcess({ command: '' }))
  t.throws(() => runa.registerChildProcess({ command: [] }))
  t.notThrows(() => runa.registerChildProcess({ command: ['pwd'] }))
})

test('tasks can be JSON.strinify', t => {
  const runa = Runa.create()
  runa.register({ start() {} })
  const task = runa.tasks[0]
  task.id = 'fakeId'

  t.is(JSON.stringify(runa.tasks), '[{"id":"fakeId","status":"STOPPED"}]')
})

test('findTask()', t => {
  const runa = Runa.create()
  runa.register({ start() {} })
  const task = runa.tasks[0]

  t.is(runa.findTask(task.id), task)
  t.is(runa.findTask('wrong-id'), undefined)
})
