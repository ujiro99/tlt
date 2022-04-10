import React from 'react'
import { useCalendarDate } from '@/hooks/useCalendarDate'
import { format } from 'date-fns'

export function RecordName(): JSX.Element {
  const [date] = useCalendarDate()
  const dateStr = `${format(date, 'MMM dd, yyyy')}`

  return (
    <p className="calendar-date">
      <span>{dateStr}</span>
    </p>
  )
}
