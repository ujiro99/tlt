import { useCallback, useState, useEffect } from 'react'
import { useStorage } from '@/hooks/useStorage'
import { Storage, STORAGE_KEY } from '@/services/storage'
import {
  GoogleCalendar,
  Calendar,
  CalendarEvent,
  CalendarColor,
} from '@/services/google/calendar'
import { sleep } from '@/services/util'

import Log from '@/services/log'

type useActivityReturn = {
  activities: CalendarEvent[]
  appendActivities: (activities: CalendarEvent[]) => void
  uploadActivities: (
    activities: CalendarEvent[],
    calendar: Calendar,
    color: CalendarColor,
    resolve: (v: unknown) => void,
  ) => Promise<void>
}

type UploadParam = {
  queue: CalendarEvent[]
  calendar: Calendar
  color: CalendarColor
  resolve: (v: unknown) => void
}

export const getActivities = async (): Promise<CalendarEvent[]> => {
  return (await Storage.get(STORAGE_KEY.ACTIVITIES)) as CalendarEvent[]
}

export const appendActivities = (
  body: CalendarEvent[],
  element: CalendarEvent[],
) => {
  let ee = element.filter((e) => e.time.toMinutes() > 1)
  const newActivities = [...body, ...ee]
  Log.d(newActivities)
  Storage.set(STORAGE_KEY.ACTIVITIES, newActivities)
}

export function useActivity(): useActivityReturn {
  const [uploadParam, setUploadParam] = useState<UploadParam>()
  const [activities, setActivities] = useStorage<CalendarEvent[]>(
    STORAGE_KEY.ACTIVITIES,
  )

  useEffect(() => {
    if (!uploadParam) return
    if (uploadParam.queue.length === 0) {
      uploadParam.resolve(null)
      return
    }
    const queue = uploadParam.queue
    const upload = async () => {
      let e = queue[0]
      if (uploadParam.color) e = { ...e, colorId: uploadParam.color.id }
      await GoogleCalendar.insertEvent(uploadParam.calendar, e)
      await sleep(200)
      const newQueue = queue.filter((n) => n.id !== e.id)
      setUploadParam({
        ...uploadParam,
        queue: newQueue,
      })
      removeActivities([e])
      if (newQueue.length === 0) {
        uploadParam.resolve(null)
      }
    }
    upload()
  }, [uploadParam])

  const _appendActivities = useCallback(
    (es: CalendarEvent[]) => {
      appendActivities(activities, es)
    },
    [activities],
  )

  const removeActivities = useCallback(
    (es: CalendarEvent[]) => {
      const newActivities = activities.filter((e) => {
        return !es.some((n) => n.id === e.id)
      })
      Log.d(newActivities)
      setActivities(newActivities)
    },
    [activities],
  )

  const uploadActivities = useCallback(
    async (
      es: CalendarEvent[],
      calendar: Calendar,
      color: CalendarColor,
      resolve: (v: unknown) => void,
    ): Promise<void> => {
      setUploadParam({ queue: es, calendar, color, resolve })
    },
    [],
  )

  return { activities, appendActivities: _appendActivities, uploadActivities }
}
