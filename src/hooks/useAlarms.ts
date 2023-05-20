import { atom, selector, useRecoilState } from 'recoil'
import { useCallback } from 'react'
import { useStorage } from '@/hooks/useStorage'
import { STORAGE_KEY } from '@/services/storage'
import { AlarmService } from '@/services/alarm'
import { Ipc } from '@/services/ipc'
import { Task } from '@/models/task'
import { Alarm } from '@/models/alarm'
import { AlarmRule } from '@/models/alarmRule'
import Log from '@/services/log'

// for debug
// chrome.alarms.clearAll()

type useAlarmsReturn = {
  alarms: Alarm[]
  setAlarms: (alarms: Alarm[]) => void
  stopAlarms: (alarms: Alarm[]) => void
  setAlarmsForTask: (task: Task) => void
  stopAlarmsForTask: () => void
}

export const alarmState = atom({
  key: 'alarmState',
  default: selector({
    key: 'alarmStateSelector',
    get: async () => {
      Log.d(`get alarmStateSelector`)
      return await AlarmService.getAlarms()
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
        _setAlarms(await AlarmService.getAlarms())
      })
    },
    [_setAlarms],
  )

  const setAlarmsForTask = useCallback(
    async (task: Task) => {
      const alarms = AlarmService.taskToAlarms(task, alarmRules)
      const promises = alarms.map(async (alarm) => {
        return Ipc.send({
          command: 'setAlarm',
          param: alarm,
        })
      })
      Promise.all(promises).then(async () => {
        _setAlarms(await AlarmService.getAlarms())
      })
    },
    [alarms, alarmRules],
  )

  const stopAlarms = useCallback(async (alarms: Alarm[]) => {
    await Ipc.send({ command: 'stopAlarms', param: alarms })
    _setAlarms(await AlarmService.getAlarms())
  }, [])

  const stopAlarmsForTask = useCallback(async () => {
    await Ipc.send({ command: 'stopAlarmsForTask' })
    _setAlarms(await AlarmService.getAlarms())
  }, [])

  return {
    alarms,
    setAlarms,
    stopAlarms,
    setAlarmsForTask,
    stopAlarmsForTask,
  }
}
