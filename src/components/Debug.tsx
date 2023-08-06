import React from 'react'
import { useTrackingState } from '@/hooks/useTrackingState'
import { useStorage } from '@/hooks/useStorage'
import { EventLine } from '@/hooks/useEventAlarm'
import { TrackingState } from '@/@types/global'
import { formatTime } from '@/services/util'
import { STORAGE_KEY } from '@/services/storage'
import { isDebug } from '@/const'
import { Time } from '@/models/time'

const trackingsToText = (trackings: TrackingState[]) => {
  let res = '<Trackings>'
  trackings.forEach((tracking) => {
    res += '\n  line: ' + tracking.line
    res += '\n  nodeId: ' + tracking.nodeId
    res += '\n  startTime: ' + formatTime(tracking.trackingStartTime)
    res += '\n  elapsedTime: ' + tracking.elapsedTime.toString()
  })
  res += '\n'
  return res
}

const calendarToText = (calendars: EventLine[]) => {
  let res = '<Calendars>'
  calendars.forEach((calendar) => {
    res += '\n  line: ' + calendar.line
    res += '\n  id: ' + calendar.event.id
    res += '\n  title: ' + calendar.event.title
    res += '\n  md: ' + calendar.event.md
    res += '\n  start: ' + calendar.event.start
    res += '\n  end: ' + calendar.event.end
    res += '\n  Length of time: ' + Time.fromTimeObject(calendar.event.time)
  })
  return res
}

export function Debug(): JSX.Element {
  const { trackings } = useTrackingState()
  const [sCalendar] = useStorage<EventLine[]>(STORAGE_KEY.CALENDAR_EVENT)
  const [sAlarms] = useStorage(STORAGE_KEY.ALARMS)

  if (!isDebug) {
    return <></>
  }

  return (
    <>
      <pre className="debug">
        <code>{trackingsToText(trackings)}</code>
      </pre>
      <pre className="debug">
        <code>{calendarToText(sCalendar)}</code>
      </pre>
      <pre className="debug">
        <code>alarms</code> <br />
        <code>{JSON.stringify(sAlarms, null, 2)}</code>
      </pre>
    </>
  )
}
