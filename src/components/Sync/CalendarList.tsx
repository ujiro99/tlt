import React, { Suspense, useEffect } from 'react'
import { useQuery } from 'react-query'

import { Icon } from '@/components/Icon'
import { GoogleCalendar, Calendar } from '@/services/google/calendar'
import { Storage, STORAGE_KEY } from '@/services/storage'

import './CalendarList.css'

const fetchCalendars = () => {
  return useQuery({
    queryKey: ['calendar'],
    queryFn: GoogleCalendar.getCalendar,
  })
}

const getCalendarFromStorage = () => {
  return useQuery({
    queryKey: ['calendarFromStorage'],
    queryFn: () => Storage.get(STORAGE_KEY.CALENDAR_DOWNLOAD),
  })
}

type CalendarListProps = {
  onChangeCalendar: (calendar: Calendar) => void
}

function Inner(props: CalendarListProps): JSX.Element {
  const resApi = fetchCalendars()
  const resStrg = getCalendarFromStorage()
  const calendar = resStrg.data as Calendar

  const onChange = async (e) => {
    const id = e.target.value
    if (id) {
      const cal = resApi.data.find((c) => c.id === id)
      await Storage.set(STORAGE_KEY.CALENDAR_DOWNLOAD, cal)
      props.onChangeCalendar(cal)
    }
    e.target.blur()
  }

  useEffect(() => {
    if (calendar?.id) {
      props.onChangeCalendar(resStrg.data as Calendar)
    }
  }, [])

  return (
    <>
      <select
        className="calendar-list__select"
        onChange={onChange}
        defaultValue={calendar.id}
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
        <Inner {...props} />
      </Suspense>
    </div>
  )
}
