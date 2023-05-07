import { useCallback } from 'react'
import { useStorage } from '@/hooks/useStorage'
import { CalendarEvent } from '@/services/google/calendar'
import { STORAGE_KEY } from '@/services/storage'
import { Alarm, ALARM_TYPE } from '@/models/alarm'
import { t } from '@/services/i18n'

export type EventLine = {
  event: CalendarEvent
  line: number
}

export const eventToAlarm = (e: CalendarEvent): Alarm => {
  return new Alarm({
    type: ALARM_TYPE.EVENT,
    name: e.title,
    when: new Date(e.start).getTime(),
    message: t('alarm_schedule_start', [e.title]),
    calendarEventId: e.id,
  })
}

type useEventAlarmReturn = {
  setEventLines: (eventLines: EventLine[]) => void
  moveEventLine: (from: number, to: number) => void
}

export function useEventAlarm(): useEventAlarmReturn {
  const [eventLines, setEventLines] = useStorage<EventLine[]>(
    STORAGE_KEY.CALENDAR_EVENT,
  )

  const moveEventLine = useCallback(
    (from: number, to: number) => {
      const newVal = eventLines.map((n) => {
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
      setEventLines(newVal)
    },
    [eventLines],
  )

  return {
    setEventLines,
    moveEventLine,
  }
}
