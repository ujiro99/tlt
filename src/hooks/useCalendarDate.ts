import { atom, useRecoilState } from 'recoil'

const dateState = atom<Date>({
  key: 'dateState',
  default: new Date(),
})

type CalendarDate = [date: Date, setDate: (date: Date) => void]
export function useCalendarDate(): CalendarDate {
  const [date, setDate] = useRecoilState(dateState)
  return [date, setDate]
}
