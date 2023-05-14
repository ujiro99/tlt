import React, { Suspense, useEffect } from 'react'
import { useQuery } from 'react-query'
import {
  GoogleCalendar,
  Calendar,
  CalendarEvent,
  RESPONSE_STATUS,
} from '@/services/google/calendar'

import './EventList.css'

const fetchEvents = (calendar: Calendar) => {
  return useQuery({
    queryKey: ['calendar', calendar],
    queryFn: async () => GoogleCalendar.fetchEvents(calendar),
  })
}

type EventListProps = {
  calendar: Calendar
  onChangeEvents: (events: CalendarEvent[]) => void
}

function Inner(props: EventListProps): JSX.Element {
  const { data } = fetchEvents(props.calendar)
  const isExist = data.length !== 0

  useEffect(() => {
    props.onChangeEvents(data)
  }, [data])

  const className = (e: CalendarEvent) => {
    let name = 'event-list__item'
    if (e.responseStatus === RESPONSE_STATUS.DECLINED) {
      name += ' mod-declined'
    }
    return name
  }

  return isExist ? (
    <ul>
      {data.map((e) => (
        <li key={e.id} className={className(e)}>
          <span className="event-list__title">{e.title}</span>
          <span className="event-list__time">{e.time.toString()}</span>
        </li>
      ))}
    </ul>
  ) : (
    <span>No schedule found</span>
  )
}

export function EventList(props: EventListProps): JSX.Element {
  return (
    <div className="event-list">
      <Suspense fallback={<span>loading...</span>}>
        <Inner {...props} />
      </Suspense>
    </div>
  )
}
