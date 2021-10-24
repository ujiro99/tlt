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

/**
 * This class represents the elapsed time.
 */
export class Time {
  static parseMs(ms: number): Time {
    const time = new Time()
    time.days = Math.floor(ms / DAY_MS)
    ms = ms % DAY_MS
    time.hours = Math.floor(ms / HOUR_MS)
    ms = ms % HOUR_MS
    time.minutes = Math.floor(ms / MINUTE_MS)
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
            time.minutes = Number(value)
            break
          case TIME_TYPE.HOUR:
            time.hours = Number(value)
            break
          case TIME_TYPE.DAY:
            time.days = Number(value)
            break
        }
      }
    }

    if (time.ms() === 0) {
      Log.w(`can't find time: ${timeStr}`)
    }

    return time
  }

  public minutes = 0
  public hours = 0
  public days = 0

  constructor(minutes = 0, hours = 0, days = 0) {
    this.minutes = minutes
    this.hours = hours
    this.days = days
  }

  public add(time: Time): void {
    this.minutes += time.minutes
    this.hours += time.hours
    this.days += time.days
  }

  public toString(): string {
    let str = ''
    if (this.days > 0) {
      str += `${this.days}d`
    }
    if (this.hours > 0) {
      str += `${this.hours}h`
    }
    if (this.minutes > 0) {
      str += `${this.minutes}m`
    }
    return str
  }

  private ms(): number {
    return this.days * DAY_MS + this.hours * HOUR_MS + this.minutes * MINUTE_MS
  }
}
