import { atom, selector, useRecoilState } from 'recoil'
import { useCallback, useState } from 'react'
import { useStorage } from '@/hooks/useStorage'
import { STORAGE_KEY } from '@/services/storage'
import { t } from '@/services/i18n'
import { Ipc } from '@/services/ipc'
import { Task } from '@/models/task'
import { Alarm } from '@/models/alarm'
import { AlarmRule, ALARM_ANCHOR, ALARM_TIMING } from '@/models/alarmRule'
import Log from '@/services/log'

/** Alarm name on chrome.alarms */
export const ALARM_TYPE = {
  ICON: 'ICON_TIMER',
  NOTIFICATION: 'NOTIFICATION',
}

/**
 * Get all alarms from chrome API.
 * @returns Promise<Alarm[]>
 */
const getAlarms = async (): Promise<Alarm[]> => {
  const all = await chrome.alarms.getAll()
  const alarms = all
    .map((a) => {
      if (a.name === ALARM_TYPE.ICON) {
        // nothing to do
      } else {
        const obj = JSON.parse(a.name)
        if (obj.name === ALARM_TYPE.NOTIFICATION) {
          //
          return new Alarm({
            name: obj.param.title,
            message: obj.param.message,
            when: a.scheduledTime,
          })
        }
      }
    })
    .filter((a) => a != null)
  return alarms
}

type useAlarmsReturn = {
  alarms: Alarm[]
  setAlarms: (task: Task) => void
  stopAllAlarms: () => void
}

export const alarmState = atom({
  key: 'alarmState',
  default: selector({
    key: 'alarmStateSelector',
    get: async () => {
      const alarms = await getAlarms()
      Log.d(`get alarmStateSelector`)
      Log.d(alarms)
      return alarms
    },
  }),
})

export function useAlarms(): useAlarmsReturn {
  const [alarms, _setAlarms] = useRecoilState<Alarm[]>(alarmState)
  const [alarmRules] = useStorage<AlarmRule[]>(STORAGE_KEY.ALARMS)

  const setAlarms = useCallback(
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
            message = t('alarm_before_schedule', [`${minutes}`])
          } else {
            minutes =
              task.estimatedTimes.toMinutes() -
              task.actualTimes.toMinutes() +
              alarm.minutes
            message = t('alarm_after_schedule', [`${minutes}`])
          }
        }
        if (minutes <= 0) return

        return Ipc.send({
          command: 'setAlarm',
          param: {
            title: task.title,
            message: message,
            minutes: minutes,
          },
        })
      })
      Promise.all(promises).then(async () => {
        _setAlarms(await getAlarms())
      })
    },
    [alarms, alarmRules],
  )

  const stopAllAlarms = useCallback(async () => {
    await Ipc.send({ command: 'stopAllAlarm' })
    _setAlarms(await getAlarms())
  }, [])

  return {
    alarms,
    setAlarms,
    stopAllAlarms,
  }
}
