import React from 'react'
import SimpleBar from 'simplebar-react'
import { useActivity } from '@/hooks/useActivity'
import { formatTime } from '@/services/util'

import './EventList.css'

type EventListProps = {}

export function UplaodEventList(props: EventListProps): JSX.Element {
  const { activities } = useActivity()
  const isExist = activities && activities.length !== 0

  return (
    <div className="event-list">
      {isExist ? (
        <SimpleBar>
          <ul>
            {activities.map((e) => (
              <li key={e.id} className="event-list__item">
                <span className="event-list__title">{e.title}</span>
                <span className="event-list__time">{formatTime(e.start)}</span>
                <span className="event-list__time-space">~</span>
                <span className="event-list__time">{formatTime(e.end)}</span>
              </li>
            ))}
          </ul>
        </SimpleBar>
      ) : (
        <span>No activity found</span>
      )}
    </div>
  )
}
