import React from 'react'
import { useCalendarEvents } from '@/hooks/useCalendarEvent'
import { formatTime } from '@/services/util'

import './EventList.css'

type EventListProps = {}

export function UplaodEventList(props: EventListProps): JSX.Element {
  const { events } = useCalendarEvents()
  const isExist = events && events.length !== 0

  return (
    <div className="event-list">
      {isExist ? (
        <ul>
          {events.map((e) => (
            <li key={e.id} className="event-list__item">
              <span className="event-list__title">{e.title}</span>
              <span className="event-list__time">{formatTime(e.start)}</span>
              <span className="event-list__time-space">~</span>
              <span className="event-list__time">{formatTime(e.end)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <span>No activity found</span>
      )}
    </div>
  )
}
