import React from 'react'
import { useCalendarDate } from '@/hooks/useCalendarDate'
import { useMode, MODE } from '@/hooks/useMode'
import { format } from 'date-fns'

export function RecordName(): JSX.Element {
  const [mode] = useMode()
  const { date, range } = useCalendarDate()

  let dateStr: string
  if (mode === MODE.SHOW || mode === MODE.EDIT) {
    dateStr = `${format(date, 'MMM dd, yyyy')}`
  } else {
    if (range && range.from && range.to) {
      dateStr = `${format(range.from, 'MMM dd, yyyy')} - ${format(
        range.to,
        'MMM dd, yyyy',
      )}`
    } else {
      dateStr = `${format(date, 'MMM dd, yyyy')}`
    }
  }

  return (
    <p className="calendar-date">
      <span>{dateStr}</span>
    </p>
  )
}
