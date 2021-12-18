import { atom, selector, useRecoilState } from 'recoil'
import {
  TrackingState,
  TimeObject,
  ITaskListState,
  ITaskState,
} from '@/@types/state'
import Log from '@/services/log'
import { STORAGE_KEY, Storage } from '@/services/storage'

import { Task } from '@/models/task'
import { Time } from '@/models/time'

/**
 * Task text saved in chrome storage.
 */
export const taskListTextState = atom({
  key: 'taskListTextState',
  default: selector({
    key: 'savedTaskListTextState',
    get: async () => {
      return (await Storage.get(STORAGE_KEY.TASK_LIST_TEXT)) as string
    },
  }),
})

export function TaskTextState(): ITaskListState {
  const [textValue, setTextValue] = useRecoilState(taskListTextState)

  const setText = async (value: string) => {
    setTextValue(value)
    await Storage.set(STORAGE_KEY.TASK_LIST_TEXT, value)
  }

  return {
    text: textValue,
    setText: async (value: string) => {
      await setText(value)
    },
    getTextByLine: (line: number) => {
      const lines = textValue.split(/\n/)
      line = line - 1 //  line number starts from 1.

      if (lines.length > line) return lines[line]
      Log.e('The specified line does not exist.')
      Log.d(`lines.length: ${lines.length}, line: ${line}`)
      return ''
    },
    setTextByLine: async (line: number, text: string) => {
      const lines = textValue.split(/\n/)
      line = line - 1 //  line number starts from 1.

      if (lines.length > line) {
        lines[line] = text
        const newText = lines.join('\n')
        await setText(newText)
      } else {
        Log.e('The specified line does not exist.')
        Log.d(`lines.length: ${lines.length}, line: ${line}`)
      }
    },
  }
}

export const trackingStateList = atom({
  key: 'trackingStateList',
  default: selector({
    key: 'savedTrackingStateList',
    get: async () => {
      const trackings = (await Storage.get(
        STORAGE_KEY.TRACKING_STATE,
      )) as TrackingState[]
      if (!trackings) return []

      return trackings.map((tracking) => {
        // Convert time object to Time class's instance.
        const obj = tracking.elapsedTime as unknown as TimeObject
        tracking.elapsedTime = new Time(
          obj._seconds,
          obj._minutes,
          obj._hours,
          obj._days,
        )

        // If the tracking is in progress, update the elapsed time to resume counting.
        if (tracking.isTracking) {
          const elapsedTimeMs = Date.now() - tracking.trackingStartTime
          const elapsedTime = Time.parseMs(elapsedTimeMs)
          tracking.elapsedTime.add(elapsedTime)
        }

        return tracking
      })
    },
  }),
  effects_UNSTABLE: [
    ({ onSet }) => {
      onSet((state) => {
        // Automatically save the tracking status.
        void Storage.set(STORAGE_KEY.TRACKING_STATE, state)
      })
    },
  ],
})

export function TaskState(): ITaskState {
  const state = TaskTextState()
  const [trackings, setTrackings] = useRecoilState(trackingStateList)

  return {
    stopAllTracking() {
      Log.v('stopAllTracking')
      for (const tracking of trackings) {
        if (tracking.isTracking) {
          const task = Task.parse(state.getTextByLine(tracking.line))
          task.trackingStop(tracking.trackingStartTime)
          void state.setTextByLine(tracking.line, task.toString())
        }
      }
      chrome.runtime.sendMessage({ command: 'stopTracking' })
      setTrackings([])
    },
  }
}
