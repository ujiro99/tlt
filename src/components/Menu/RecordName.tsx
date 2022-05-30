import React from 'react'
import { format } from 'date-fns'

type Props = {
  date1: Date
  date2?: Date
}

const DATE_FMT = 'MMM dd, yyyy'

export function RecordName(props: Props): JSX.Element {
  let dateStr: string
  if (props.date1 && props.date2) {
    dateStr = `${format(props.date1, DATE_FMT)} - ${format(
      props.date2,
      DATE_FMT,
    )}`
  } else {
    dateStr = `${format(props.date1, DATE_FMT)}`
  }

  return (
    <p className="calendar-date">
      <span>{dateStr}</span>
    </p>
  )
}
