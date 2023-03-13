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

type useCalendarEventsReturn = {
  events: CalendarEvent[]
  setEvents: (events: CalendarEvent[]) => void
  appendEvents: (events: CalendarEvent[]) => void
  uploadEvents: (
    events: CalendarEvent[],
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

export function useCalendarEvents(): useCalendarEventsReturn {
  const [uploadParam, setUploadParam] = useState<UploadParam>()

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
      removeEvents([e])
      if (newQueue.length === 0) {
        uploadParam.resolve(null)
      }
    }
    upload()
  }, [uploadParam])

  const [events, _setEvents] = useStorage<CalendarEvent[]>(
    STORAGE_KEY.ACTIVITIES,
  )

  const setEvents = useCallback(
    (es: CalendarEvent[]) => {
      Log.d(es)
      _setEvents(es)
    },
    [events],
  )

  const appendEvents = useCallback(
    (es: CalendarEvent[]) => {
      const newEvents = [...events, ...es]
      Log.d(newEvents)
      _setEvents(newEvents)
    },
    [events],
  )

  const removeEvents = useCallback(
    (es: CalendarEvent[]) => {
      const newEvents = events.filter((e) => {
        return !es.some((n) => n.id === e.id)
      })
      Log.d(newEvents)
      _setEvents(newEvents)
    },
    [events],
  )

  const uploadEvents = useCallback(
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

  return { events, setEvents, appendEvents, uploadEvents }
}
