import React, { Suspense, useEffect } from 'react'
import { useQuery } from 'react-query'

import { useStorage } from '@/hooks/useStorage'
import { GoogleCalendar, Calendar } from '@/services/google/calendar'
import { StorageKey } from '@/services/storage'
import Log from '@/services/log'
import { Icon } from '@/components/Icon'
import { Select } from '@/components/Select'

import './CalendarList.css'

const fetchCalendars = () => {
  return useQuery({
    queryKey: ['calendar'],
    queryFn: GoogleCalendar.fetchCalendars,
    staleTime: 60 * 1000,
  })
}

type CalendarListProps = {
  calendarKey: StorageKey
  onChangeCalendar: (calendar: Calendar) => void
}

function CalendarListInner(props: CalendarListProps): JSX.Element {
  const [calendar, setCalendar] = useStorage<Calendar>(props.calendarKey)
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
      <Select defaultValue="">
        <option key="0" value="" disabled>
          No calendar found
        </option>
      </Select>
    )
  }

  return (
    <>
      <Select onChange={onChange} defaultValue={calendar ? calendar.id : ''}>
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
      </Select>
    </>
  )
}

export function CalendarList(props: CalendarListProps): JSX.Element {
  return (
    <div className="calendar-list">
      <Suspense fallback={<Select loading={true} />}>
        <CalendarListInner {...props} />
      </Suspense>
    </div>
  )
}
