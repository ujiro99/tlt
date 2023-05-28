import { rand } from '@/services/util'
import { t } from '@/services/i18n'

export const ALARM_TIMING = {
  BEFORE: 'BEFORE',
  AFTER: 'AFTER',
}
export type AlarmTiming = (typeof ALARM_TIMING)[keyof typeof ALARM_TIMING]

export const ALARM_ANCHOR = {
  START: 'start time',
  SCEHEDULED: 'scheduled time',
}
export type AlarmAnchor = (typeof ALARM_ANCHOR)[keyof typeof ALARM_ANCHOR]

export class AlarmRule {
  id: string
  minutes: number
  timing: AlarmTiming
  anchor: AlarmAnchor

  constructor(timing: AlarmTiming, anchor: AlarmAnchor, minutes: number) {
    this.timing = timing
    this.anchor = anchor
    this.minutes = minutes
    this.id = rand()
  }

  static fromText(str: String): AlarmRule {
    const ss = str.split(',')

    if (ss.length !== 3) {
      throw new Error('Invalid alarm string')
    }

    // minutes
    const minutes = parseInt(ss[0].trim())

    // timing
    let timing: AlarmTiming
    ss[1].trim().toUpperCase() === ALARM_TIMING.BEFORE
      ? (timing = ALARM_TIMING.BEFORE)
      : (timing = ALARM_TIMING.AFTER)

    // anchor
    let anchor: AlarmAnchor
    if (ss[2].trim() === ALARM_ANCHOR.START) {
      anchor = ALARM_ANCHOR.START
    } else if (ss[2].trim() === ALARM_ANCHOR.SCEHEDULED) {
      anchor = ALARM_ANCHOR.SCEHEDULED
    }

    return new AlarmRule(timing, anchor, minutes)
  }

  static checkParams(
    timing: AlarmTiming,
    anchor: AlarmAnchor,
    minutes: number,
  ): boolean {
    if (minutes < 0) return false
    if (anchor === ALARM_ANCHOR.START && timing === ALARM_TIMING.AFTER) {
      return true
    } else if (anchor === ALARM_ANCHOR.SCEHEDULED) {
      return true
    }
    return false
  }

  static toText(alarm: AlarmRule): String {
    if (alarm == null) return null

    let msg
    if (alarm.anchor === ALARM_ANCHOR.START) {
      msg = t('alarm_after_start', [`${alarm.minutes}`])
    } else if (alarm.anchor === ALARM_ANCHOR.SCEHEDULED) {
      if (alarm.timing === ALARM_TIMING.BEFORE) {
        msg = t('alarm_before_schedule', [`${alarm.minutes}`])
      } else {
        msg = t('alarm_after_schedule', [`${alarm.minutes}`])
      }
    }
    return msg
  }
}
