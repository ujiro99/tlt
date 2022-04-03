import { useCallback } from 'react'
import { atom, selector, useRecoilState } from 'recoil'

import { useTaskManager } from '@/hooks/useTaskManager'
import { STORAGE_KEY, Storage } from '@/services/storage'
import Log from '@/services/log'
import { TrackingState, TimeObject } from '@/@types/state'
import { Task } from '@/models/task'
import { Time } from '@/models/time'
import { findNode } from '@/models/node'

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
  addTracking: (tracking: TrackingState) => void
  removeTracking: (line: number) => void
  stopAllTracking: () => void
  stopOtherTracking: (line: number) => void
}

export function useTrackingState(): useTrackingStateReturn {
  const manager = useTaskManager()
  const [trackings, setTrackings] = useRecoilState(trackingStateList)

  const stopAllTracking = useCallback(() => {
    Log.d('stopAllTracking')
    stopTrackings()
  }, [trackings])

  const stopOtherTracking = useCallback((line: number) => {
    Log.d('stopOtherTracking')
    stopTrackings(line)
  }, [trackings])

  const stopTrackings = (exceptLine?: number) => {
    const root = manager.getRoot()
    for (const tracking of trackings) {
      if (tracking.isTracking && tracking.line !== exceptLine) {
        const node = findNode(root, (n) => n.line === tracking.line)
        if (node && node.data instanceof Task) {
          // Clone the objects for updating.
          const newNode = node.clone()
          const newTask = newNode.data as Task
          newTask.trackingStop(tracking.trackingStartTime)
          // TODO fix to be update multiple nodes.
          manager.setNodeByLine(newNode, tracking.line)
        }
      }
    }
    chrome.runtime.sendMessage({ command: 'stopTracking' })
    setTrackings(trackings.filter((n) => {
      return n.line === exceptLine
    }))
  }

  const addTracking = useCallback((tracking: TrackingState) => {
    const newVal = [...trackings, tracking]
    setTrackings(newVal)
  }, [trackings])

  const removeTracking = useCallback((line: number) => {
    const newVal = trackings.filter((n) => {
      return n.line !== line
    })
    setTrackings(newVal)
  }, [trackings])

  return { trackings, addTracking, removeTracking, stopAllTracking, stopOtherTracking }
}
