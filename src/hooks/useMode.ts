import { atom, useRecoilState } from 'recoil'

import { TaskRecordKey } from '@/models/taskRecordKey'
import { useTaskRecordKey } from '@/hooks/useTaskRecordKey'
import { useCalendarDate } from '@/hooks/useCalendarDate'

export const MODE = {
  EDIT: 'EDIT',
  SHOW: 'SHOW',
  REPORT: 'REPORT',
} as const
export type MenuMode = (typeof MODE)[keyof typeof MODE]

/**
 * Ui mode.
 */
const modeState = atom<MenuMode>({
  key: 'modeState',
  default: MODE.SHOW,
})

type ModeReturn = [mode: MenuMode, setMode: (mode: MenuMode) => void]

export function useMode(): ModeReturn {
  const [mode, setMode] = useRecoilState(modeState)
  const { setKey } = useTaskRecordKey()
  const { date, range } = useCalendarDate()

  const changeMode = (mode: MenuMode): void => {
    if (mode === MODE.SHOW || mode === MODE.EDIT) {
      setKey(TaskRecordKey.fromDate(date))
    } else {
      if (range && range.from && range.to) {
        setKey(TaskRecordKey.fromDate([range.from, range.to]))
      } else {
        setKey(TaskRecordKey.fromDate(date))
      }
    }
    setMode(mode)
  }

  return [mode, changeMode]
}
