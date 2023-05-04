import { format } from 'date-fns'

const TIME_FMT = 'HH:mm'

export class Alarm {
  name: string
  message: string
  scheduledTime: number

  constructor({ name, message, minutes = 0, when = 0 }) {
    if (minutes === 0 && when === 0)
      throw Error('minutes and when cannot be null at the same time')

    this.scheduledTime = when
    if (minutes > 0) {
      this.scheduledTime = Date.now() + minutes * 60 * 1000
    }

    this.name = name
    this.message = message
  }

  get time(): string {
    return format(this.scheduledTime, TIME_FMT)
  }

  // for debug
  toString(): string {
    return `${this.name} ${this.message} ${format(
      this.scheduledTime,
      TIME_FMT,
    )}`
  }
}
