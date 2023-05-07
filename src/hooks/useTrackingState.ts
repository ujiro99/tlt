import { useCallback } from 'react'
import { format } from 'date-fns-tz'
import { atom, selector, useRecoilState, useRecoilValue } from 'recoil'

import { nodeState, useTaskManager } from '@/hooks/useTaskManager'
import { taskRecordKeyState } from '@/hooks/useTaskRecordKey'
import { updateRecords, saveRecords, loadRecords } from '@/hooks/useTaskStorage'
import {
  useActivity,
  appendActivities,
  getActivities,
} from '@/hooks/useActivity'
import { useAlarms } from '@/hooks/useAlarms'
import { STORAGE_KEY, Storage } from '@/services/storage'
import { Ipc } from '@/services/ipc'
import Log from '@/services/log'
import { TrackingState, TimeObject } from '@/@types/global'
import { Node, setNodeByLine } from '@/models/node'
import { Task } from '@/models/task'
import { Time } from '@/models/time'
import { TaskRecordKey } from '@/models/taskRecordKey'

const TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ssXXX"

/**
 * Convert time object to Time class's instance.
 */
const convTime = (tracking: TrackingState): TrackingState => {
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
}

export const stopTrackings = async (
  root: Node,
  trackings: TrackingState[],
  key: TaskRecordKey,
  exceptNodeId?: string,
) => {
  const events = []
  for (const tracking of trackings) {
    if (!tracking.isTracking || tracking.nodeId === exceptNodeId) {
      continue
    }
    const node = root.find((n) => n.line === tracking.line)
    if (node == null || !(node.data instanceof Task)) {
      continue
    }

    // Clone the objects for updating elapsed time.
    const newNode = node.clone()
    const newTask = newNode.data as Task
    newTask.trackingStop(tracking.trackingStartTime)
    root = setNodeByLine(root, node.line, newNode)

    // For updating activities.
    const start = format(tracking.trackingStartTime, TIME_FORMAT)
    const end = format(Date.now(), TIME_FORMAT)
    const ems = Date.now() - tracking.trackingStartTime
    const time = Time.parseMs(ems)
    events.push({
      id: '' + Math.random(),
      title: newTask.title,
      time,
      start,
      end,
    })
  }

  // Update root Node.
  const records = await loadRecords()
  const newRecords = updateRecords(records, key, root)
  await saveRecords(newRecords)

  // Update activities.
  const activities = await getActivities()
  if (events.length > 0) appendActivities(activities, events)

  // Update tracking state.
  await Storage.set(
    STORAGE_KEY.TRACKING_STATE,
    trackings.filter((n) => {
      return n.nodeId === exceptNodeId
    }),
  )
}

const trackingState = atom<TrackingState[]>({
  key: 'trackingState',
  default: selector({
    key: 'savedTrackingStateList',
    get: async () => {
      const trackings = (await Storage.get(
        STORAGE_KEY.TRACKING_STATE,
      )) as TrackingState[]
      if (!trackings) return []

      return trackings.map((tracking) => convTime(tracking))
    },
  }),
  effects: [
    ({ onSet, setSelf }) => {
      Storage.addListener(STORAGE_KEY.TRACKING_STATE, (newVal) => {
        const newTrackings = newVal.map((tracking) => convTime(tracking))
        setSelf(newTrackings)
      })

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
      if (t.key !== key.toKey()) {
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

interface useTrackingStateReturn {
  trackings: TrackingState[]
  startTracking: (node: Node) => void
  stopTracking: (node: Node, checked?: boolean) => void
}

export function useTrackingState(): useTrackingStateReturn {
  const manager = useTaskManager()
  const { appendActivities } = useActivity()
  const { setAlarmsForTask, stopAlarmsForTask } = useAlarms()
  const [trackings, setTrackings] = useRecoilState(trackingStateSelector)
  const trackingKey = useRecoilValue(taskRecordKeyState)

  const startTracking = useCallback(
    (node: Node) => {
      // start new task.
      const newNode = node.clone()
      const newTask = newNode.data as Task
      const trackingStartTime = newTask.trackingStart()
      const tracking = {
        key: trackingKey.toKey(),
        nodeId: node.id,
        isTracking: true,
        trackingStartTime,
        elapsedTime: newTask.actualTimes,
        line: node.line,
      }

      // Clone the objects for updating.
      manager.setNodeByLine(newNode, node.line)

      // Stop previous alarms.
      stopAlarmsForTask()

      const newVal = [...trackings, tracking]
      setTrackings(newVal)
      Ipc.send({
        command: 'startTracking',
        param: tracking.elapsedTime.toMinutes(),
      })
      setAlarmsForTask(newTask)
    },
    [trackings],
  )

  const stopTracking = useCallback(
    (node: Node, checked?: boolean) => {
      // Clone the objects for updating.
      const newNode = node.clone()
      const newTask = newNode.data as Task

      // update node & task
      const tracking = trackings.find((n) => n.nodeId === node.id)
      if (tracking) newTask.trackingStop(tracking.trackingStartTime)
      if (checked != null) newTask.setComplete(checked)
      manager.setNodeByLine(newNode, node.line)

      // update calendar events
      if (tracking) {
        const start = format(tracking.trackingStartTime, TIME_FORMAT)
        const end = format(Date.now(), TIME_FORMAT)
        const ems = Date.now() - tracking.trackingStartTime
        const time = Time.parseMs(ems)
        appendActivities([
          {
            id: '' + Math.random(),
            title: newTask.title,
            time,
            start,
            end,
          },
        ])
      }

      // stop tracking state
      const newVal = trackings.filter((n) => {
        return n.nodeId !== node.id
      })
      setTrackings(newVal)
      Ipc.send({ command: 'stopTracking' })
      stopAlarmsForTask()
    },
    [trackings],
  )

  return {
    trackings,
    startTracking,
    stopTracking,
  }
}

export function useTrackingMove() {
  const [trackings, setTrackings] = useRecoilState(trackingStateSelector)

  const moveTracking = useCallback(
    (from: number, to: number) => {
      const newVal = trackings.map((n) => {
        // From -> to
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
    moveTracking,
  }
}

interface useTrackingStopReturn {
  stopAllTracking: () => void
  stopOtherTracking: (nodeId: string) => void
}

export function useTrackingStop(): useTrackingStopReturn {
  const manager = useTaskManager()
  const root = manager.getRoot()
  const trackingKey = useRecoilValue(taskRecordKeyState)
  const [trackings] = useRecoilState(trackingStateSelector)
  const { stopAlarmsForTask } = useAlarms()

  const stopAllTracking = useCallback(() => {
    Log.d('stopAllTracking')
    stopTrackings(root, trackings, trackingKey)
    Ipc.send({ command: 'stopTracking' })
    stopAlarmsForTask()
  }, [trackings])

  const stopOtherTracking = useCallback(
    (nodeId: string) => {
      Log.d(`stopOtherTracking: ${nodeId}`)
      stopTrackings(root, trackings, trackingKey, nodeId)
    },
    [trackings],
  )

  return {
    stopAllTracking,
    stopOtherTracking,
  }
}
