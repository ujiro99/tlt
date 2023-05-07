import { format } from 'date-fns'

/** Alarm name on chrome.alarms */
export const ALARM_TYPE = {
  ICON: 'ICON_TIMER',
  TASK: 'TASK',
  EVENT: 'EVENT',
}
type AlarmType = (typeof ALARM_TYPE)[keyof typeof ALARM_TYPE]

const TIME_FMT = 'HH:mm'

export type AlarmObject = {
  type: AlarmType
  name: string
  message: string
  time: number
  eventId: string
}

export class Alarm {
  type: AlarmType
  name: string
  message: string
  scheduledTime: number
  calendarEventId: string

  static fromString(str: string): Alarm {
    const obj = JSON.parse(str) as unknown as AlarmObject
    const alarm = new Alarm({
      type: obj.type,
      name: obj.name,
      message: obj.message,
      when: obj.time,
      calendarEventId: obj.eventId,
    })
    alarm.type = obj.type
    return alarm
  }

  constructor({
    type,
    name,
    message,
    minutes = 0,
    when = 0,
    calendarEventId = '',
  }) {
    if (minutes === 0 && when === 0 && type != ALARM_TYPE.ICON) {
      throw Error('minutes and when cannot be null at the same time')
    }
    this.type = type
    this.name = name
    this.message = message
    this.scheduledTime = when
    this.calendarEventId = calendarEventId
    if (minutes > 0) {
      this.scheduledTime = Date.now() + minutes * 60 * 1000
    }
  }

  get time(): string {
    return format(this.scheduledTime, TIME_FMT)
  }

  toKey(): string {
    return `${this.name} ${this.message} ${format(
      this.scheduledTime,
      TIME_FMT,
    )}`
  }

  toString(): string {
    const obj: AlarmObject = {
      type: this.type,
      name: this.name,
      message: this.message,
      time: this.scheduledTime,
      eventId: this.calendarEventId,
    }
    return JSON.stringify(obj)
  }
}
