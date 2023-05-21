import Log from '@/services/log'
import { t } from '@/services/i18n'
import { Task } from '@/models/task'
import { Alarm, ALARM_TYPE } from '@/models/alarm'
import { AlarmRule, ALARM_ANCHOR, ALARM_TIMING } from '@/models/alarmRule'

export const AlarmService = {
  /**
   * Get all alarms from chrome API.
   * @returns Promise<Alarm[]>
   */
  getAlarms: async (): Promise<Alarm[]> => {
    const all = await chrome.alarms.getAll()
    const alarms = all
      .map((a) => {
        return Alarm.fromString(a.name)
      })
      .filter((a) => a.type !== ALARM_TYPE.ICON)
      .sort((a, b) => a.scheduledTime - b.scheduledTime)
    Log.d(alarms)
    return alarms
  },

  /**
   * Convert task to alarms based on alarm rules.
   * @returns alarms
   */
  taskToAlarms: (task: Task, alarmRules: AlarmRule[]): Alarm[] => {
    return alarmRules
      .map((rule) => {
        let minutes = 0
        let message: string
        if (rule.anchor === ALARM_ANCHOR.START) {
          if (rule.timing === ALARM_TIMING.AFTER) {
            minutes = rule.minutes
            message = t('alarm_after_start', [`${rule.minutes}`])
          }
        } else if (rule.anchor === ALARM_ANCHOR.SCEHEDULED) {
          if (task.estimatedTimes.toMinutes() === 0) {
            Log.d('alarm not set because scheduled time is 0.')
            return
          }
          if (rule.timing === ALARM_TIMING.BEFORE) {
            minutes =
              task.estimatedTimes.toMinutes() -
              task.actualTimes.toMinutes() -
              rule.minutes
            message = t('alarm_before_schedule', [`${rule.minutes}`])
          } else {
            minutes =
              task.estimatedTimes.toMinutes() -
              task.actualTimes.toMinutes() +
              rule.minutes
            message = t('alarm_after_schedule_message', [`${rule.minutes}`])
          }
        }
        if (minutes <= 0) return
        return new Alarm({
          type: ALARM_TYPE.TASK,
          name: task.title,
          message: message,
          minutes: minutes,
        })
      })
      .filter((a) => a != null)
  },
}
