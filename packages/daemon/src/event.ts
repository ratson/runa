import { Except } from "type-fest"

export enum EventType {
  ProcessStart = "runa.process-start",
  ProcessEnd = "runa.process-end",
  GetProcessList = "runa.get-process-list",
}

export type ProcessStartEvent = {
  type: EventType.ProcessStart
  pid: number
  command: {
    args: string[]
    cwd: string
    pid: number
  }
}

export type ManagedProcess = Except<ProcessStartEvent, "type">

type ProcessEndEvent = {
  type: EventType.ProcessEnd
  pid: number
}

export type Event =
  | ProcessStartEvent
  | ProcessEndEvent
  | { type: EventType.GetProcessList }
