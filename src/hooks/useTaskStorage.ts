import { useEffect } from 'react'
import {
  atom,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
  DefaultValue,
} from 'recoil'
import {
  nodeState,
  TaskRecordType,
  TaskRecordArray,
} from '@/hooks/useTaskManager'
import { taskRecordKeyState } from '@/hooks/useTaskRecordKey'
import { useTimeHistory } from '@/hooks/useTimeHistory'
import { STORAGE_KEY, Storage } from '@/services/storage'
import Log from '@/services/log'
import { TaskRecordKey } from '@/models/taskRecordKey'
import { Node, NODE_TYPE, nodeToString, getCollapsedLines } from '@/models/node'
import { Task } from '@/models/task'
import { sleep } from '@/services/util'

export const isPossibleToSaveState = atom<boolean>({
  key: 'isPossibleToSaveState',
  default: true,
})

export const savingState = atom<boolean>({
  key: 'savingState',
  default: false,
})

/**
 * All of TaskRecords saved in chrome storage.
 */
export const allRecordsState = atom<TaskRecordArray>({
  key: 'taskRecordsState',
  default: [],
  effects: [
    ({ trigger, setSelf, onSet }) => {
      if (trigger === 'get') {
        setSelf(loadRecords())
      }

      Storage.addListener(STORAGE_KEY.TASK_LIST_TEXT, (newVal) => {
        setSelf(newVal)
      })

      onSet(async (newVal) => {
        if (newVal instanceof DefaultValue) {
          await Storage.remove(STORAGE_KEY.TASK_LIST_TEXT)
        } else {
          await saveRecords(newVal)
        }
      })
    },
  ],
})

export const updateRecords = (
  records: TaskRecordArray,
  key: TaskRecordKey,
  root: Node,
): TaskRecordArray => {
  let found = false
  const data = nodeToString(root)
  const collapsedLines = getCollapsedLines(root)
  const newRecords = records.map((r) => {
    if (r.key === key.toKey()) {
      found = true
      return {
        ...r,
        data,
        collapsedLines,
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
      collapsedLines,
    }
    newRecords.push(r)
  }
  return newRecords
}

export const loadRecords = async (): Promise<TaskRecordArray> => {
  const records =
    ((await Storage.get(STORAGE_KEY.TASK_LIST_TEXT)) as TaskRecordArray) || []
  Log.d('loadRecords', records)
  return records
}

export const saveRecords = async (
  records: TaskRecordArray,
): Promise<boolean> => {
  Log.d('saveRecords', records)
  try {
    const res = await Storage.set(STORAGE_KEY.TASK_LIST_TEXT, records)
    return res === true
  } catch (e) {
    Log.w(e)
    return false
  }
}

export function useTaskStorage(): void {
  const { addTimes } = useTimeHistory()
  const [records, setRecords] = useRecoilState(allRecordsState)
  const key = useRecoilValue(taskRecordKeyState)
  const root = useRecoilValue(nodeState)
  const setSaving = useSetRecoilState(savingState)
  const isPossibleToSave = useRecoilValue(isPossibleToSaveState)

  useEffect(() => {
    if (isPossibleToSave) {
      void saveToStorage()
    }
  }, [root])

  const saveToStorage = async () => {
    setSaving(true)
    const newRecords = updateRecords(records, key, root)
    setRecords(newRecords)
    updateTimeHistory()
    await sleep(1000)
    setSaving(false)
  }

  const updateTimeHistory = () => {
    let times: string[] = []
    root.each((n) => {
      if (n.type === NODE_TYPE.TASK) {
        const task = n.data as Task
        if (task.estimatedTimes) {
          times.push(task.estimatedTimes.toString())
        }
      }
    })
    addTimes(times)
  }
}
