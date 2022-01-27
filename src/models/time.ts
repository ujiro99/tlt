import Log from '@/services/log'

const TIME_TYPE = {
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
    time._days = Math.floor(seconds / DAY_S)
    seconds = seconds % DAY_S
    time._hours = Math.floor(seconds / HOUR_S)
    seconds = seconds % HOUR_S
    time._minutes = Math.floor(seconds / MINUTE_S)
    seconds = seconds % MINUTE_S
    time._seconds = seconds
    return time
  }

  static parseStr(timeStr: string): Time {
    const timeRegexps = [
      { type: TIME_TYPE.MINUTE, regexp: /(\d+)m/ },
      { type: TIME_TYPE.HOUR, regexp: /(\d+)h/ },
      { type: TIME_TYPE.DAY, regexp: /(\d+)d/ },
    ]

    const time = new Time()
    for (const tr of timeRegexps) {
      if (tr.regexp.test(timeStr)) {
        const result = tr.regexp.exec(timeStr)
        const value = result[1]
        if (!value) continue
        switch (tr.type) {
          case TIME_TYPE.MINUTE:
            time._minutes = Number(value)
            break
          case TIME_TYPE.HOUR:
            time._hours = Number(value)
            break
          case TIME_TYPE.DAY:
            time._days = Number(value)
            break
        }
      }
    }

    if (time.toSeconds() === 0) {
      Log.w(`can't find time: ${timeStr}`)
    }

    return time
  }

  private _seconds = 0
  private _minutes = 0
  private _hours = 0
  private _days = 0

  public constructor(seconds = 0, minutes = 0, hours = 0, days = 0) {
    this._seconds = seconds
    this._minutes = minutes
    this._hours = hours
    this._days = days
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

  public toString(): string {
    let str = ''
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
    return this._days * DAY_S + this._hours * HOUR_S + this._minutes * MINUTE_S + this._seconds
  }

  public toMinutes(): number {
    return this.toSeconds() / MINUTE_S
  }

  public isEmpty(): boolean {
    return this._days === 0 && this._hours === 0 && this._minutes === 0
  }

  public get seconds(): number {
    return this._seconds;
  }

  public get minutes(): number {
    return this._minutes;
  }

  public get hours(): number {
    return this._hours;
  }

  public get days(): number {
    return this._days;
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
