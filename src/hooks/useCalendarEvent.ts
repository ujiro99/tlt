import { useCallback } from 'react'
import { useStorage } from '@/hooks/useStorage'
import { STORAGE_KEY } from '@/services/storage'
import { CalendarEvent } from '@/services/google/calendar'
import Log from '@/services/log'

type useCalendarEventsReturn = {
  events: CalendarEvent[]
  setEvents: (events: CalendarEvent[]) => void
  appendEvents: (events: CalendarEvent[]) => void
  removeEvents: (events: CalendarEvent[]) => void
}

export function useCalendarEvents(): useCalendarEventsReturn {
  const [events, _setEvents] = useStorage<CalendarEvent[]>(
    STORAGE_KEY.ACTIVITIES
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

  return { events, setEvents, appendEvents, removeEvents }
}
