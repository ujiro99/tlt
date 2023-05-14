import { atom, selector, useRecoilState } from 'recoil'
import { useCallback } from 'react'
import { useStorage } from '@/hooks/useStorage'
import { STORAGE_KEY } from '@/services/storage'
import { t } from '@/services/i18n'
import { Ipc } from '@/services/ipc'
import { Task } from '@/models/task'
import { Alarm, ALARM_TYPE } from '@/models/alarm'
import { AlarmRule, ALARM_ANCHOR, ALARM_TIMING } from '@/models/alarmRule'
import Log from '@/services/log'

// for debug
// chrome.alarms.clearAll()

/**
 * Get all alarms from chrome API.
 * @returns Promise<Alarm[]>
 */
const getAlarms = async (): Promise<Alarm[]> => {
  const all = await chrome.alarms.getAll()
  const alarms = all
    .map((a) => {
      return Alarm.fromString(a.name)
    })
    .filter((a) => a.type !== ALARM_TYPE.ICON)
    .sort((a, b) => a.scheduledTime - b.scheduledTime)
  Log.d(alarms)
  return alarms
}

type useAlarmsReturn = {
  alarms: Alarm[]
  setAlarms: (alarms: Alarm[]) => void
  setAlarmsForTask: (task: Task) => void
  stopAlarmsForTask: () => void
}

export const alarmState = atom({
  key: 'alarmState',
  default: selector({
    key: 'alarmStateSelector',
    get: async () => {
      Log.d(`get alarmStateSelector`)
      const alarms = await getAlarms()
      Log.d(alarms)
      return alarms
    },
  }),
})

export function useAlarms(): useAlarmsReturn {
  const [alarms, _setAlarms] = useRecoilState<Alarm[]>(alarmState)
  const [alarmRules] = useStorage<AlarmRule[]>(STORAGE_KEY.ALARMS)

  const setAlarms = useCallback(
    async (alarms: Alarm[]) => {
      const promises = alarms.map((alarm) => {
        if (alarm.scheduledTime < Date.now()) {
          // Exclude alarms that are past the time
          return
        }
        return Ipc.send({
          command: 'setAlarm',
          param: alarm,
        })
      })
      Promise.all(promises).then(async () => {
        _setAlarms(await getAlarms())
      })
    },
    [_setAlarms],
  )

  const setAlarmsForTask = useCallback(
    async (task: Task) => {
      const promises = alarmRules.map(async (alarm) => {
        let minutes = 0
        let message: string
        if (alarm.anchor === ALARM_ANCHOR.START) {
          if (alarm.timing === ALARM_TIMING.AFTER) {
            minutes = alarm.minutes
            message = t('alarm_after_start', [`${minutes}`])
          }
        } else if (alarm.anchor === ALARM_ANCHOR.SCEHEDULED) {
          if (task.estimatedTimes.toMinutes() === 0) {
            Log.d('alarm not set because scheduled time is 0.')
            return
          }
          if (alarm.timing === ALARM_TIMING.BEFORE) {
            minutes =
              task.estimatedTimes.toMinutes() -
              task.actualTimes.toMinutes() -
              alarm.minutes
            message = t('alarm_before_schedule', [`${alarm.minutes}`])
          } else {
            minutes =
              task.estimatedTimes.toMinutes() -
              task.actualTimes.toMinutes() +
              alarm.minutes
            message = t('alarm_after_schedule_message', [`${minutes}`])
          }
        }
        if (minutes <= 0) return

        return Ipc.send({
          command: 'setAlarm',
          param: new Alarm({
            type: ALARM_TYPE.TASK,
            name: task.title,
            message: message,
            minutes: minutes,
          }),
        })
      })
      Promise.all(promises).then(async () => {
        _setAlarms(await getAlarms())
      })
    },
    [alarms, alarmRules],
  )

  const stopAlarmsForTask = useCallback(async () => {
    await Ipc.send({ command: 'stopAlarmsForTask' })
    _setAlarms(await getAlarms())
  }, [])

  return {
    alarms,
    setAlarms,
    setAlarmsForTask,
    stopAlarmsForTask,
  }
}
