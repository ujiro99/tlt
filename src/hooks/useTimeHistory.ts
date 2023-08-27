import { useCallback } from 'react'
import { atom, useRecoilState } from 'recoil'
import { unique } from '@/services/util'

const MaxCount = 10

const timeHistoryState = atom<string[]>({
  key: 'timeHistoryState',
  default: [],
})

interface useTimeHistoryReturn {
  times: string[]
  addTimes: (times: string[]) => void
}

export function useTimeHistory(): useTimeHistoryReturn {
  const [times, setTimes] = useRecoilState(timeHistoryState)
  const reversed = [...times].reverse()

  const addTimes = useCallback(
    (timesToAdd: string[]) => {
      if (!timesToAdd || timesToAdd.length === 0) return
      let newTimes = [...times, ...timesToAdd]
      newTimes = unique(newTimes).filter((t) => t !== '')
      newTimes = newTimes.slice(-MaxCount)
      setTimes(newTimes)
      console.warn('newTimes', newTimes)
    },
    [times],
  )

  return {
    times: reversed,
    addTimes,
  }
}
