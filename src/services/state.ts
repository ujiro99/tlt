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
  effects_UNSTABLE: [
    ({onSet}) => {
      onSet(text => {
        void Storage.set(STORAGE_KEY.TASK_LIST_TEXT, text)
      });
    },
  ],
})

export function TaskTextState(): ITaskListState {
  const [textValue, setTextValue] = useRecoilState(taskListTextState)

  const setText = (value: string) => {
    setTextValue(value)
  }

  return {
    text: textValue,
    setText: (value: string) => {
      setText(value)
    },
    getTextByLine: (line: number) => {
      line = line - 1 //  line number starts from 1.
      const lines = textValue.split(/\n/)

      if (lines.length > line) return lines[line]
      Log.e('The specified line does not exist.')
      Log.d(`lines.length: ${lines.length}, line: ${line}`)
      return ''
    },
    setTextByLine: (line: number, text: string) => {
      line = line - 1 //  line number starts from 1.
      const lines = textValue.split(/\n/)

      if (lines.length > line) {
        lines[line] = text
        const newText = lines.join('\n')
        setText(newText)
      } else {
        Log.e('The specified line does not exist.')
        Log.d(`lines.length: ${lines.length}, line: ${line}`)
      }
    },
    isTaskStrByLine: (line: number) => {
      line = line - 1 //  line number starts from 1.
      const lines = textValue.split(/\n/)
      return Task.isTaskStr(lines[line])
    },
    moveLines: (
      currentPosition: number,
      newPosition: number,
      count = 1,
    ) => {
      if (currentPosition === newPosition) return

      //  line number starts from 1.
      currentPosition = currentPosition - 1
      newPosition = newPosition - 1

      const lines = textValue.split(/\n/)
      if (newPosition > lines.length) {
        newPosition = lines.length - 1
      }

      const sliced = lines.slice(currentPosition, currentPosition + count)

      if (currentPosition < newPosition) {
        lines.splice(newPosition + 1, 0, ...sliced) // insert new items
        lines.splice(currentPosition, count) // remove old items
      } else {
        lines.splice(newPosition + 1, 0, ...sliced)
        lines.splice(currentPosition + count, count)
      }

      // update state
      const newText = lines.join('\n')
      setText(newText)
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
