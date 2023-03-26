import { atom, useRecoilValue, useSetRecoilState } from 'recoil'
import { allRecordsState } from '@/hooks/useTaskManager'
import { TaskRecordKey } from '@/models/taskRecordKey'

export const taskRecordKeyState = atom<TaskRecordKey>({
  key: 'taskRecordKeyState',
  default: TaskRecordKey.fromDate(new Date()),
})

interface useTaskRecordKeyReturn {
  setKey: (key: TaskRecordKey) => void
  recordKeys: string[]
}

export function useTaskRecordKey(): useTaskRecordKeyReturn {
  const setRecordKey = useSetRecoilState(taskRecordKeyState)
  const records = useRecoilValue(allRecordsState)
  const recordKeys = records.map((r) => r.key)

  return {
    setKey: setRecordKey,
    recordKeys,
  }
}
