import { atom, useRecoilValue, useRecoilState } from 'recoil'
import { useTaskManager, selectRecord } from '@/hooks/useTaskManager'
import { allRecordsState } from '@/hooks/useTaskStorage'
import { TaskRecordKey } from '@/models/taskRecordKey'

export const taskRecordKeyState = atom<TaskRecordKey>({
  key: 'taskRecordKeyState',
  default: TaskRecordKey.fromDate(new Date()),
})

interface useTaskRecordKeyReturn {
  setKey: (key: TaskRecordKey) => void
  recordKeys: string[]
  currentKey: TaskRecordKey
}

export function useTaskRecordKey(): useTaskRecordKeyReturn {
  const [recordKey, setRecordKey] = useRecoilState(taskRecordKeyState)
  const records = useRecoilValue(allRecordsState)
  const recordKeys = records.map((r) => r.key)
  const mananer = useTaskManager()

  const setKey = (key) => {
    setRecordKey(key)
    const record = selectRecord(key, records)
    mananer.setRoot(record)
  }

  return {
    setKey,
    recordKeys,
    currentKey: recordKey
  }
}
