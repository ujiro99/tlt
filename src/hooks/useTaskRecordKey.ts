import { atom, useRecoilValue, useSetRecoilState } from 'recoil'
import { taskRecordsState } from '@/hooks/useTaskManager'
import { isPossibleToSaveState } from '@/hooks/useTaskStorage'
import { TaskRecordKey, KEY_TYPE } from '@/models/taskRecordKey'

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
  const setIsPossibleToSave = useSetRecoilState(isPossibleToSaveState)
  const records = useRecoilValue(taskRecordsState)
  const recordKeys = records.map((r) => r.key)

  return {
    setKey: (key: TaskRecordKey) => {
      if (key.keyType === KEY_TYPE.RANGE) {
        setIsPossibleToSave(false)
      } else {
        setIsPossibleToSave(true)
      }
      setRecordKey(key)
    },
    recordKeys,
  }
}
