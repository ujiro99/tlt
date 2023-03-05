import React, { Suspense } from 'react'
import { useQuery } from 'react-query'
import { GoogleCalendar, Calendar } from '@/services/google/calendar'

import './EventList.css'

const fetchEvents = (calendar: Calendar) => {
  return useQuery({
    queryKey: ['calendar', calendar],
    queryFn: async () => GoogleCalendar.getEvents(calendar),
  })
}

type EventListProps = {
  calendar: Calendar
}

function Inner(props: EventListProps): JSX.Element {
  const { data } = fetchEvents(props.calendar)
  const isExist = data.length !== 0

  return isExist ? (
    <ul>
      {data.map((e) => (
        <li key={e.id} className="event-list__item">
          <span>{e.title}</span>
          <span>{e.time.toString()}</span>
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
