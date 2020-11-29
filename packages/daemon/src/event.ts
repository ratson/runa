import { Except } from "type-fest"

export enum EventType {
  ProcessStart = "runa.process-start",
  ProcessEnd = "runa.process-end",
  GetProcessList = "runa.get-process-list",
  RestartProcesses = "runa.restart-processes",
}

export type ProcessStartEvent = {
  type: EventType.ProcessStart
  pid: number
  command: {
    args: string[]
    cwd: string
  }
}

export type ManagedProcessData = Except<ProcessStartEvent, "type">

export type ProcessEndEvent = {
  type: EventType.ProcessEnd
  pid: number
}

export type RestartProcessesEvent = {
  type: EventType.RestartProcesses
  pids: number[]
}

export type Event =
  | ProcessStartEvent
  | ProcessEndEvent
  | { type: EventType.GetProcessList }
  | RestartProcessesEvent
