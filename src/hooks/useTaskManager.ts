import { useEffect } from 'react'
import {
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil'
import Log from '@/services/log'
import { STORAGE_KEY, Storage } from '@/services/storage'
import { Parser } from '@/services/parser'
import {
  Node,
  nodeToString,
  NODE_TYPE
} from '@/models/node'
import { flat } from '@/models/flattenedNode'
import { TaskRecordKey, KEY_TYPE } from '@/models/taskRecordKey'

const EmptyNode = new Node(NODE_TYPE.OTHER, 0, "")

enum TaskRecordType {
  Date,
}

interface TaskRecord {
  key: string
  type: TaskRecordType
  data: string
}

type TaskRecordArray = TaskRecord[]

const taskRecordKeyState = atom<TaskRecordKey>({
  key: 'taskRecordKeyState',
  default: TaskRecordKey.fromDate(new Date()),
})

export const isPossibleToSaveState = atom<boolean>({
  key: 'isPossibleToSaveState',
  default: true,
})

export const savingState = atom<boolean>({
  key: 'savingState',
  default: false,
})

// void Storage.remove(STORAGE_KEY.TASK_LIST_TEXT)

const loadRecords = async (): Promise<TaskRecordArray> => {
  const records =
    ((await Storage.get(STORAGE_KEY.TASK_LIST_TEXT)) as TaskRecordArray) || []
  Log.d(records)
  return records
}

const saveRecords = async (records: TaskRecordArray): Promise<boolean> => {
  try {
    const res = await Storage.set(STORAGE_KEY.TASK_LIST_TEXT, records)
    return res === true
  } catch (e) {
    Log.w(e)
    return false
  }
}

/**
 * All of TaskRecords saved in chrome storage.
 */
const taskRecordsState = atom({
  key: 'taskRecordsState',
  default: selector({
    key: 'nodeStateSelctor',
    get: async () => {
      Log.d(`get taskRecordsState`)
      return await loadRecords()
    },
  }),
})

/**
 * Task text saved in chrome storage.
 */
const taskRecordSelector = selector<Node>({
  key: 'taskRecordSelector',
  get: ({ get }) => {
    const records = get(taskRecordsState)
    const key = get(taskRecordKeyState)
    Log.d(`get taskRecordSelector: ${key.toKey()}`)

    if (key.keyType === KEY_TYPE.SINGLE) {
      const record = records.find((r) => r.key === key.toKey())
      if (record) {
        return Parser.parseMd(record.data)
      } else {
        // If today's task data does not exist,
        // copy the uncompleted data from the most recent past data.
        const lastRecord = records[records.length - 1]
        if (lastRecord) {
          const lastRoot = Parser.parseMd(lastRecord.data)
          return lastRoot.filter((n) => !n.isComplete())
        } else {
          // Nothing to load.
          return Parser.parseMd('')
        }
      }
    } else {
      const range = records.filter((r) => key.keys.includes(r.key))
      return Parser.parseArray(range.map((r) => r.data))
    }
  },
})

export const nodeState = atom<Node>({
  key: 'nodeState',
  default: selector({
    key: 'nodeStateSelector',
    get: ({ get }) => {
      Log.d(`get nodeStateSelector`)
      return get(taskRecordSelector)
    },
  }),
})

interface ITaskManager {
  lineCount: number
  setKey: (key: TaskRecordKey) => void
  getText: () => string
  setText: (value: string) => void
  getTextByLine: (line: number) => string
  setTextByLine: (line: number, text: string) => void
  getRoot: () => Node
  setRoot: (node: Node) => void
  getNodeByLine: (line: number) => Node
  setNodeByLine: (node: Node, line: number) => void
}
export function useTaskManager(): ITaskManager {
  const [root, setRoot] = useRecoilState(nodeState)
  const setRecordKey = useSetRecoilState(taskRecordKeyState)
  const setIsPossibleToSave = useSetRecoilState(isPossibleToSaveState)

  const flatten = flat(root)

  const getNodeByLine = (line: number): Node | null => {
    return root.find((n) => n.line === line)
  }

  const setNodeByLine = (node: Node, line: number) => {
    let newRoot: Node
    if (line > flatten.length) {
      newRoot = root.append(node)
    } else if (node) {
      newRoot = root.replace(node, (n) => n.line === line)
    } else {
      const target = root.find((n) => n.line === line)
      if (target.children.length > 0) {
        // set empty line
        newRoot = root.replace(EmptyNode, (n) => n.line === line)
      } else {
        // remove this line
        newRoot = root.filter((n) => n.line !== line)
      }
    }
    setRoot(newRoot)
  }

  return {
    lineCount: flatten.length,
    setKey: (key: TaskRecordKey) => {
      if (key.keyType === KEY_TYPE.RANGE) {
        setIsPossibleToSave(false)
      } else {
        setIsPossibleToSave(true)
      }
      setRecordKey(key)
    },
    getText: () => {
      return nodeToString(root)
    },
    setText: (value: string) => {
      const root = Parser.parseMd(value)
      setRoot(root)
    },
    getTextByLine: (line: number) => {
      const node = getNodeByLine(line)
      return node ? node.toString() : ''
    },
    setTextByLine: (line: number, text: string) => {
      const root = Parser.parseMd(text)
      setNodeByLine(root.children[0], line)
    },
    getRoot: () => {
      return root
    },
    setRoot: setRoot,
    getNodeByLine,
    setNodeByLine,
  }
}

export function useTaskStorage(): void {
  const [records, setRecords] = useRecoilState(taskRecordsState)
  const setSaving = useSetRecoilState(savingState)
  const isPossibleToSave = useRecoilValue(isPossibleToSaveState)

  const record = useRecoilValue(taskRecordSelector)
  const key = useRecoilValue(taskRecordKeyState)
  const [root, setRoot] = useRecoilState(nodeState)

  useEffect(() => {
    if (isPossibleToSave) {
      void saveToStorage()
    }
  }, [root])

  useEffect(() => {
    setRoot(record)
  }, [key])

  const saveToStorage = async () => {
    const data = nodeToString(root)
    if (data.length === 0) return
    setSaving(true)
    let found = false
    const newRecords = records.map((r) => {
      if (r.key === key.toKey()) {
        found = true
        return {
          ...r,
          data
        }
      } else {
        return r
      }
    })
    if (!found) {
      const record = {
        key: key.toKey(),
        type: TaskRecordType.Date,
        data
      }
      newRecords.push(record)
    }
    setRecords(newRecords)
    await saveRecords(newRecords)
    setSaving(false)
  }
}

type TaskRecordKeys = [keys: string[]]
export function useTaskRecordKeys(): TaskRecordKeys {
  const records = useRecoilValue(taskRecordsState)
  const keys = records.map((r) => r.key)
  return [keys]
}
