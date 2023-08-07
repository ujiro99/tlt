import Log from '@/services/log'
import { TimeObject } from '@/@types/global'

const TIME_TYPE = {
  NEGATIVE_SIGN: 'NEGATIVE_SIGN',
  MINUTE: 'MINUTE',
  HOUR: 'HOUR',
  DAY: 'DAY',
}

const SECOND_MS = 1000
const MINUTE_MS = 60 * SECOND_MS
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

const MINUTE_S = 60
const HOUR_S = 60 * MINUTE_S
const DAY_S = 24 * HOUR_S

const MINUTE = 60
const HOUR = 60
const DAY = 24

/**
 * This class represents the elapsed time.
 */
export class Time {
  static parseMs(ms: number): Time {
    const time = new Time()
    if (ms < 0) {
      time._isNegative = true
      ms = Math.abs(ms)
    }

    time._days = Math.floor(ms / DAY_MS)
    ms = ms % DAY_MS
    time._hours = Math.floor(ms / HOUR_MS)
    ms = ms % HOUR_MS
    time._minutes = Math.floor(ms / MINUTE_MS)
    ms = ms % MINUTE_MS
    time._seconds = Math.floor(ms / SECOND_MS)
    return time
  }

  static parseSecond(seconds: number): Time {
    const time = new Time()
    if (seconds < 0) {
      time._isNegative = true
      seconds = Math.abs(seconds)
    }

    time._days = Math.floor(seconds / DAY_S)
    seconds = seconds % DAY_S
    time._hours = Math.floor(seconds / HOUR_S)
    seconds = seconds % HOUR_S
    time._minutes = Math.floor(seconds / MINUTE_S)
    seconds = seconds % MINUTE_S
    time._seconds = seconds
    return time
  }

  static parseHour(hours: number): Time {
    const time = new Time()
    if (hours < 0) {
      time._isNegative = true
      hours = Math.abs(hours)
    }
    time._days = Math.floor(hours / 24)
    hours = hours % 24
    time._hours = Math.floor(hours)
    hours = hours % 1
    time._minutes = Math.floor(hours * 60)
    return time
  }

  static parseStr(timeStr: string): Time {
    const timeRegexps = [
      { type: TIME_TYPE.NEGATIVE_SIGN, regexp: /^(-)/ },
      { type: TIME_TYPE.MINUTE, regexp: /(\d+)m/ },
      { type: TIME_TYPE.HOUR, regexp: /(\d+(?:\.\d+)?)h/ },
      { type: TIME_TYPE.DAY, regexp: /(\d+(?:\.\d+)?)d/ },
    ]

    const time = new Time()
    for (const tr of timeRegexps) {
      if (tr.regexp.test(timeStr)) {
        const result = tr.regexp.exec(timeStr)
        const value = result[1]

        if (!value) continue // check match

        switch (tr.type) {
          case TIME_TYPE.NEGATIVE_SIGN:
            time._isNegative = true
            break
          case TIME_TYPE.MINUTE:
            time._minutes += Number(value)
            break
          case TIME_TYPE.HOUR: {
            const hour = Number(value)
            const hourInt = Math.floor(hour)
            const hourDecimal = hour - hourInt
            time._hours += hourInt
            time._minutes += Math.floor(hourDecimal * HOUR)
            break
          }
          case TIME_TYPE.DAY: {
            const days = Number(value)
            const daysInt = Math.floor(days)
            const daysDecimal = days - Math.floor(days)
            time._days += daysInt
            const hour = daysDecimal * DAY
            const hourInt = Math.floor(hour)
            const hourDecimal = hour - hourInt
            time._hours += hourInt
            time._minutes += Math.floor(hourDecimal * HOUR)
            break
          }
        }
      }
    }

    if (time.toSeconds() === 0) {
      Log.w(`can't find time: ${timeStr}`)
    }

    return time
  }

  static subs(a: Time, b: Time): number {
    const s = a._seconds - b._seconds
    const m = a._minutes - b._minutes
    const h = a._hours - b._hours
    const d = a._days - b._days
    return d * DAY_S + h * HOUR_S + m * MINUTE_S + s
  }

  static fromTimeObject(obj: TimeObject|Time): Time {
    let timeObject = obj as TimeObject
    return new Time(
      timeObject._seconds,
      timeObject._minutes,
      timeObject._hours,
      timeObject._days,
    )
  }

  private _isNegative = false
  private _seconds = 0
  private _minutes = 0
  private _hours = 0
  private _days = 0

  public constructor(seconds = 0, minutes = 0, hours = 0, days = 0, isNegative = false) {
    this._seconds = seconds
    this._minutes = minutes
    this._hours = hours
    this._days = days
    this._isNegative = isNegative
    this.calculateCarryUp()
  }

  public add(time: Time): Time {
    this._seconds += time._seconds
    this._minutes += time._minutes
    this._hours += time._hours
    this._days += time._days
    this.calculateCarryUp()
    return this
  }

  public divide(time: Time): number {
    if (this.isEmpty()) return undefined
    if (time.isEmpty()) return undefined
    return this.toSeconds() / time.toSeconds()
  }

  public toString(): string {
    let str = ''
    if (this._isNegative) {
      str += `-`
    }
    if (this._days > 0) {
      str += `${this._days}d`
    }
    if (this._hours > 0) {
      str += `${this._hours}h`
    }
    if (this._minutes > 0) {
      str += `${this._minutes}m`
    }
    return str
  }

  public toSeconds(): number {
    return (
      this._days * DAY_S +
      this._hours * HOUR_S +
      this._minutes * MINUTE_S +
      this._seconds
    )
  }

  public toMinutes(): number {
    return this.toSeconds() / MINUTE_S
  }

  public toHours(): number {
    return this.toSeconds() / MINUTE_S / HOUR
  }

  public isEmpty(): boolean {
    return this._days === 0 && this._hours === 0 && this._minutes === 0
  }

  public isNegative(): boolean {
    return this._isNegative
  }

  public get seconds(): number {
    return this._seconds
  }

  public get minutes(): number {
    return this._minutes
  }

  public get hours(): number {
    return this._hours
  }

  public get days(): number {
    return this._days
  }

  public clone(): Time {
    return new Time(this._seconds, this._minutes, this._hours, this._days)
  }

  private calculateCarryUp(): void {
    if (this._seconds >= MINUTE) {
      this._minutes += Math.floor(this._seconds / MINUTE)
      this._seconds = this._seconds % MINUTE
    }
    if (this._minutes >= HOUR) {
      this._hours += Math.floor(this._minutes / HOUR)
      this._minutes = this._minutes % HOUR
    }
    if (this._hours >= DAY) {
      this._days += Math.floor(this._hours / DAY)
      this._hours = this._hours % DAY
    }
  }
}
