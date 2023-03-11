import React, { Suspense, useEffect } from 'react'
import { useQuery } from 'react-query'

import { Icon } from '@/components/Icon'
import { useStorage } from '@/hooks/useStorage'
import { GoogleCalendar, Calendar } from '@/services/google/calendar'
import { STORAGE_KEY } from '@/services/storage'
import Log from '@/services/log'

import './CalendarList.css'

const fetchCalendars = () => {
  return useQuery({
    queryKey: ['calendar'],
    queryFn: GoogleCalendar.fetchCalendars,
  })
}

type CalendarListProps = {
  onChangeCalendar: (calendar: Calendar) => void
}

function CalendarListInner(props: CalendarListProps): JSX.Element {
  const [calendar, setCalendar] = useStorage<Calendar>(
    STORAGE_KEY.CALENDAR_DOWNLOAD,
  )

  const resApi = fetchCalendars()
  const needReAuth = resApi.data == null
  const calendarFound = resApi.data?.length > 0

  const onChange = async (e) => {
    const id = e.target.value
    if (id) {
      const cal = resApi.data.find((c) => c.id === id)
      setCalendar(cal)
      props.onChangeCalendar(cal)
    }
    e.target.blur()
  }

  useEffect(() => {
    Log.v(calendar)
    props.onChangeCalendar(calendar)
  }, [])

  if (needReAuth) {
    return (
      <p className="calendar-list__error">
        <Icon className="calendar-list__error-icon" name="error" />
        Re-authorization is required.
      </p>
    )
  }

  if (!calendarFound) {
    return (
      <select className="calendar-list__select" defaultValue="">
        <option key="0" value="" disabled>
          No calendar found
        </option>
      </select>
    )
  }

  return (
    <>
      <select
        className="calendar-list__select"
        onChange={onChange}
        defaultValue={calendar?.id}
      >
        <option key="0" value="" disabled>
          -- please select --
        </option>
        {resApi.data.map((d) => {
          return (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          )
        })}
      </select>
      <Icon className="calendar-list__expand" name="expand" />
    </>
  )
}

export function CalendarList(props: CalendarListProps): JSX.Element {
  return (
    <div className="calendar-list">
      <Suspense
        fallback={
          <select className="calendar-list__select mod-loading"></select>
        }
      >
        <CalendarListInner {...props} />
      </Suspense>
    </div>
  )
}
