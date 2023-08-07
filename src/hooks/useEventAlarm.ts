import { useCallback } from 'react'
import { useStorage } from '@/hooks/useStorage'
import { CalendarEvent } from '@/services/google/calendar'
import { STORAGE_KEY } from '@/services/storage'
import { t } from '@/services/i18n'
import { equalsEventAndTask } from '@/services/google/util'
import { moveLine } from '@/services/util'
import { Alarm, ALARM_TYPE } from '@/models/alarm'
import { Task } from '@/models/task'
import { Node, NODE_TYPE } from '@/models/node'
import { useAlarms } from '@/hooks/useAlarms'

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
  moveEventLine: (from: number, to: number, length: number) => void
  fixEventLines: (root: Node) => void
}

export function useEventAlarm(): useEventAlarmReturn {
  const [eventLines, setEventLines] = useStorage<EventLine[]>(
    STORAGE_KEY.CALENDAR_EVENT,
  )
  const { stopAlarms } = useAlarms()

  const moveEventLine = useCallback(
    (from: number, to: number, length: number) => {
      const newVal = eventLines
        .map((n) => {
          if (n.line === from && to == null) {
            // Remove this line.
            stopAlarms([eventToAlarm(n.event)])
          }
          return {
            ...n,
            line: moveLine(n.line, from, to, length),
          }
        })
        .filter((n) => n.line != null)
      setEventLines(newVal)
    },
    [eventLines],
  )

  /**
   * Fix line numbers as much as possible to match the result of editing in the TaskTextarea.
   */
  const fixEventLines = useCallback(
    (root: Node) => {
      const newEventLines = eventLines
        .map((e) => {
          const found = root.find((n) => {
            if (n.type === NODE_TYPE.TASK) {
              const task = n.data as Task
              return equalsEventAndTask(e.event, task)
            }
            return false
          })
          if (!found) {
            return null
          }
          return {
            ...e,
            line: found.line,
          }
        })
        .filter((e) => e !== null)
      setEventLines(newEventLines)
    },
    [eventLines],
  )

  return {
    setEventLines,
    moveEventLine,
    fixEventLines,
  }
}
