import { format, parse, add, differenceInCalendarDays } from 'date-fns'

export const KEY_TYPE = {
  SINGLE: 'SINGLE',
  RANGE: 'RANGE',
} as const
type KeyType = typeof KEY_TYPE[keyof typeof KEY_TYPE]

const KeyFormat = 'yyyyMMdd'

const RangeSeparator = '-'

function swap<T>(a: T, b: T): T[] {
  return [b, a]
}

export class TaskRecordKey {
  public keyType: KeyType
  public rawKey: string
  public keys: string[]

  public static fromDate(date: Date): TaskRecordKey {
    return new TaskRecordKey(format(date, KeyFormat))
  }

  public static dateToKey(date: Date): string {
    return format(date, KeyFormat)
  }

  /**
   * @param keyStr String representing a date in the format "yyyyMMdd".
   */
  constructor(keyStr: string) {
    this.keyType = KEY_TYPE.SINGLE
    this.rawKey = keyStr
    this.keys = []

    if (keyStr.indexOf(RangeSeparator) > 0) {
      // type range
      let from = parse(keyStr.split(RangeSeparator)[0], KeyFormat, new Date())
      let to = parse(keyStr.split(RangeSeparator)[1], KeyFormat, new Date())
      let diff = differenceInCalendarDays(to, from)
      if (diff < 0) {
        [from, to] = swap(from, to)
        diff = -diff
      }

      for (let i = 0; i <= diff; i++) {
        this.keys.push(format(add(from, { days: i }), KeyFormat))
      }

      this.keyType = KEY_TYPE.RANGE
    } else {
      // type single
      this.keys.push(keyStr)
    }
  }

  /**
   * Returns a normalized key.
   */
  public toKey(): string {
    if(this.keyType === KEY_TYPE.SINGLE) {
      return this.rawKey
    } else {
      return `${this.keys[0]}${RangeSeparator}${this.keys[this.keys.length - 1]}`
    }
  }
}
