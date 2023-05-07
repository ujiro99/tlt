import { useCallback, useState, useEffect } from 'react'
import { useStorage } from '@/hooks/useStorage'
import { STORAGE_KEY } from '@/services/storage'
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

  const appendActivities = useCallback(
    (es: CalendarEvent[]) => {
      let ee = es.filter((e) => e.time.toMinutes() > 1)
      const newActivities = [...activities, ...ee]
      Log.d(newActivities)
      setActivities(newActivities)
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

  return { activities, appendActivities, uploadActivities }
}
