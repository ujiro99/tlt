import { useEffect } from 'react'
import { atom, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  nodeState,
  taskRecordsState,
  TaskRecordType,
  TaskRecordArray,
} from '@/hooks/useTaskManager'
import { taskRecordKeyState } from '@/hooks/useTaskRecordKey'
import { nodeToString } from '@/models/node'
import { STORAGE_KEY, Storage } from '@/services/storage'
import Log from '@/services/log'

export const isPossibleToSaveState = atom<boolean>({
  key: 'isPossibleToSaveState',
  default: true,
})

export const savingState = atom<boolean>({
  key: 'savingState',
  default: false,
})

const saveRecords = async (records: TaskRecordArray): Promise<boolean> => {
  try {
    const res = await Storage.set(STORAGE_KEY.TASK_LIST_TEXT, records)
    return res === true
  } catch (e) {
    Log.w(e)
    return false
  }
}

export function useTaskStorage(): void {
  const [records, setRecords] = useRecoilState(taskRecordsState)
  const key = useRecoilValue(taskRecordKeyState)
  const root = useRecoilValue(nodeState)
  const setSaving = useSetRecoilState(savingState)
  const isPossibleToSave = useRecoilValue(isPossibleToSaveState)

  useEffect(() => {
    console.log(isPossibleToSave, key)
    if (isPossibleToSave) {
      void saveToStorage()
    }
  }, [root])

  const saveToStorage = async () => {
    const data = nodeToString(root)
    setSaving(true)
    let found = false
    const newRecords = records.map((r) => {
      if (r.key === key.toKey()) {
        found = true
        return {
          ...r,
          data,
        }
      } else {
        return r
      }
    })
    if (!found) {
      const r = {
        key: key.toKey(),
        type: TaskRecordType.Date,
        data,
      }
      newRecords.push(r)
    }
    setRecords(newRecords)
    await saveRecords(newRecords)
    setSaving(false)
  }
}
