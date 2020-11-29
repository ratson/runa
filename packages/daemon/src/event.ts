export enum EventType {
  ProcessStart = "runa.process-start",
  ProcessEnd = "runa.process-end",
  GetProcessList = "runa.get-process-list",
}

export type ProcessStartEvent = {
  type: EventType.ProcessStart
  pid: number
}

type ProcessEndEvent = {
  type: EventType.ProcessEnd
  pid: number
}

export type Event =
  | ProcessStartEvent
  | ProcessEndEvent
  | { type: EventType.GetProcessList }
