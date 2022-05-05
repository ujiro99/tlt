import { atom, useRecoilState } from 'recoil'

const dateState = atom<Date>({
  key: 'dateState',
  default: new Date(),
})

export type DateRange = {
  from: Date
  to: Date
}

const dateRangeState = atom<DateRange>({
  key: 'dateRangeState',
  default: { from: null, to: null },
})

type CalendarDate = {
  date: Date
  range: DateRange
  setDate: (date: Date) => void
  setDateRange: (range: DateRange) => void
}

export function useCalendarDate(): CalendarDate {
  const [date, setDate] = useRecoilState(dateState)
  const [range, setDateRange] = useRecoilState(dateRangeState)

  return {
    date,
    range,
    setDate,
    setDateRange,
  }
}
