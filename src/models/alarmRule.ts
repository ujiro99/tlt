export const ALARM_TIMING = {
  BEFORE: 'BEFORE',
  AFTER: 'AFTER',
}
type AlarmTiming = (typeof ALARM_TIMING)[keyof typeof ALARM_TIMING]

export const ALARM_ANCHOR = {
  START: 'start time',
  SCEHEDULED: 'scheduled time',
}
type AlarmAnchor = (typeof ALARM_ANCHOR)[keyof typeof ALARM_ANCHOR]

export class AlarmRule {
  minutes: number
  timing: AlarmTiming
  anchor: AlarmAnchor

  constructor(timing: AlarmTiming, anchor: AlarmAnchor, minutes: number) {
    this.timing = timing
    this.anchor = anchor
    this.minutes = minutes
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
    ss[1].trim().toUpperCase() === ALARM_TIMING.BEFORE ? timing = ALARM_TIMING.BEFORE : timing = ALARM_TIMING.AFTER
    
    // anchor
    let anchor: AlarmAnchor
    if (ss[2].trim() === ALARM_ANCHOR.START) {
      anchor = ALARM_ANCHOR.START
    } else if (ss[2].trim() === ALARM_ANCHOR.SCEHEDULED) {
      anchor = ALARM_ANCHOR.SCEHEDULED
    }
    
    return new AlarmRule(timing, anchor, minutes)
  }
  
  static toText(alarm: AlarmRule): String {
    if (alarm == null) return null
    return `${alarm.minutes}, ${alarm.timing}, ${alarm.anchor}`
  }
}
