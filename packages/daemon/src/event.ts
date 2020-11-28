export enum Event {
  ProcessStart = "runa.process-start",
}

export type ProcessStartData = {
  pid: number
}

export type EventData = ProcessStartData
