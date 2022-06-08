import { useCallback } from 'react'
import { atom, selector, useRecoilState } from 'recoil'

import { nodeState, useTaskManager, taskRecordKeyState } from '@/hooks/useTaskManager'
import { STORAGE_KEY, Storage } from '@/services/storage'
import { Ipc } from '@/services/ipc'
import Log from '@/services/log'
import { TrackingState, TimeObject } from '@/@types/global'
import { Task } from '@/models/task'
import { Time } from '@/models/time'

const trackingState = atom<TrackingState[]>({
  key: 'trackingState',
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

const trackingStateSelector = selector<TrackingState[]>({
  key: 'trackingStateSelector',
  get: ({ get }) => {
    const key = get(taskRecordKeyState)
    const trackings = get(trackingState)
    const root = get(nodeState)

    // Since the node id changes with each parsing, find and update the new id
    // using the line number as a key.
    return trackings.map((t) => {
      if(t.key !== key.toKey()) {
        return t
      }
      const node = root.find((n) => n.line === t.line)
      if (node) {
        return {
          ...t,
          nodeId: node.id,
        }
      }
      return t
    })
  },
  set: ({ set }, state) => {
    set(trackingState, state)
  },
})

interface useTrackingStopReturn {
  stopAllTracking: () => void
  stopOtherTracking: (nodeId: string) => void
}

export function useTrackingStop(): useTrackingStopReturn {
  const manager = useTaskManager()
  const [trackings, setTrackings] = useRecoilState(trackingStateSelector)

  const stopAllTracking = useCallback(() => {
    Log.d('stopAllTracking')
    stopTrackings()
    Ipc.send({ command: 'stopTracking' })
  }, [trackings])

  const stopOtherTracking = useCallback(
    (nodeId: string) => {
      Log.d(`stopOtherTracking: ${nodeId}`)
      stopTrackings(nodeId)
    },
    [trackings],
  )

  const stopTrackings = (exceptNodeId?: string) => {
    const root = manager.getRoot()
    for (const tracking of trackings) {
      if (tracking.isTracking && tracking.nodeId !== exceptNodeId) {
        const node = root.find((n) => n.id === tracking.nodeId)
        if (node && node.data instanceof Task) {
          // Clone the objects for updating.
          const newNode = node.clone()
          const newTask = newNode.data as Task
          newTask.trackingStop(tracking.trackingStartTime)
          // TODO fix to be update multiple nodes.
          manager.setNodeByLine(newNode, node.line)
        }
      }
    }
    setTrackings(
      trackings.filter((n) => {
        return n.nodeId === exceptNodeId
      }),
    )
  }

  return {
    stopAllTracking,
    stopOtherTracking
  }
}

interface useTrackingStateReturn {
  trackings: TrackingState[]
  addTracking: (tracking: TrackingState) => void
  removeTracking: (nodeId: string) => void
  moveTracking: (from: number, to: number) => void
}

export function useTrackingState(): useTrackingStateReturn {
  const [trackings, setTrackings] = useRecoilState(trackingStateSelector)

  const addTracking = useCallback(
    (tracking: TrackingState) => {
      const newVal = [...trackings, tracking]
      setTrackings(newVal)
      Ipc.send({
        command: 'startTracking',
        param: tracking.elapsedTime.toMinutes(),
      })
    },
    [trackings],
  )

  const removeTracking = useCallback(
    (nodeId: string) => {
      const newVal = trackings.filter((n) => {
        return n.nodeId !== nodeId
      })
      setTrackings(newVal)
      Ipc.send({ command: 'stopTracking' })
    },
    [trackings],
  )

  const moveTracking = useCallback(
    (from: number, to: number) => {
      const newVal = trackings.map((n) => {
        if (n.line === from) {
          return {
            ...n,
            line: to,
          }
        }
        if (from > n.line && n.line >= to) {
          // Move down
          return {
            ...n,
            line: n.line + 1,
          }
        }
        if (from < n.line && n.line <= to) {
          // Move up
          return {
            ...n,
            line: n.line - 1,
          }
        }
        return n
      })
      setTrackings(newVal)
    },
    [trackings],
  )

  return {
    trackings,
    addTracking,
    removeTracking,
    moveTracking,
  }
}
