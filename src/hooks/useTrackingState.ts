import { atom, selector, useRecoilState } from 'recoil'

import { useTaskManager } from '@/hooks/useTaskManager'
import { STORAGE_KEY, Storage } from '@/services/storage'
import Log from '@/services/log'
import { TrackingState, TimeObject } from '@/@types/state'
import { Task } from '@/models/task'
import { Time } from '@/models/time'

export const trackingStateList = atom<TrackingState[]>({
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

interface useTrackingStateReturn {
  trackings: TrackingState[]
  setTrackings: (trackings: TrackingState[]) => void
  stopAllTracking: () => void
}

export function useTrackingState(): useTrackingStateReturn {
  const manager = useTaskManager()
  const [trackings, setTrackings] = useRecoilState(trackingStateList)

  function stopAllTracking() {
    Log.v('stopAllTracking')
    for (const tracking of trackings) {
      if (tracking.isTracking) {
        const task = Task.parse(manager.getTextByLine(tracking.line))
        task.trackingStop(tracking.trackingStartTime)
        void manager.setTextByLine(tracking.line, task.toString())
      }
    }
    chrome.runtime.sendMessage({ command: 'stopTracking' })
    setTrackings([])
  }

  return { trackings, setTrackings, stopAllTracking }
}
