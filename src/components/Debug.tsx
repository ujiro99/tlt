import React from 'react'
import { TrackingState } from '@/@types/global'
import { useTrackingState } from '@/hooks/useTrackingState'
import { useStorage } from '@/hooks/useStorage'
import { EventLine } from '@/hooks/useEventAlarm'
import { useTaskManager } from '@/hooks/useTaskManager'
import { formatTime } from '@/services/util'
import { STORAGE_KEY } from '@/services/storage'
import { isDebug } from '@/const'
import { Time } from '@/models/time'
import { Node, NODE_TYPE } from '@/models/node'
import { Task } from '@/models/task'
import { flattenTree } from '@/components/Tree/utilities'

const trackingsToText = (trackings: TrackingState[]) => {
  let res = '<Trackings>'
  trackings.forEach((tracking) => {
    res += '\n- line: ' + tracking.line
    res += '\n  nodeId: ' + tracking.nodeId
    res += '\n  startTime: ' + formatTime(tracking.trackingStartTime)
    res +=
      '\n  elapsedTime: ' + Time.elapsed(tracking.trackingStartTime).toString()
  })
  res += '\n'
  return res
}

const calendarToText = (calendars: EventLine[]) => {
  let res = '<Calendars>'
  calendars.forEach((calendar) => {
    res += '\n- line: ' + calendar.line
    res += '\n  id: ' + calendar.event.id
    res += '\n  title: ' + calendar.event.title
    res += '\n  md: ' + calendar.event.md
    res += '\n  start: ' + calendar.event.start
    res += '\n  end: ' + calendar.event.end
    res += '\n  Length of time: ' + Time.fromTimeObject(calendar.event.time)
  })
  return res
}

const nodeToText = (root: any) => {
  const flatten = flattenTree([root])
  let res = '<Node>'
  flatten.forEach((item) => {
    const n = item as any as Node
    if (n.type === NODE_TYPE.ROOT) {
      return
    }
    res += `\n  id: ${n.id} line: ${n.line} type: ${n.type} - ${
      (n.data as Task).title
    }`
  })
  return res
}

export function Debug(): JSX.Element {
  const { trackings } = useTrackingState()
  const [sCalendar] = useStorage<EventLine[]>(STORAGE_KEY.CALENDAR_EVENT)
  const [sAlarms] = useStorage(STORAGE_KEY.ALARMS)
  const root = useTaskManager().getRoot()

  if (!isDebug) {
    return <></>
  }

  return (
    <details className="debug">
      <summary>Debug</summary>
      <section className="debug__content">
        <pre className="debug__label">
          <code>{nodeToText(root)}</code>
        </pre>
        <pre className="debug__label">
          <code>{trackingsToText(trackings)}</code>
        </pre>
        <pre className="debug__label">
          <code>{calendarToText(sCalendar)}</code>
        </pre>
        <pre className="debug__label">
          <code>Alarms</code> <br />
          <code>{JSON.stringify(sAlarms, null, 2)}</code>
        </pre>
      </section>
    </details>
  )
}
