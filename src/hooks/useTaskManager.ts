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
import { Node, nodeToString, NODE_TYPE } from '@/models/node'
import { Tag, hasTags } from '@/models/tag'
import { flat } from '@/models/flattenedNode'
import { TaskRecordKey, KEY_TYPE } from '@/models/taskRecordKey'
import { useTagHistory } from '@/hooks/useTagHistory'
import { useTrackingState } from '@/hooks/useTrackingState'
import { unique, difference } from '@/services/util'
import { COLOR } from '@/const'

const EmptyNode = new Node(NODE_TYPE.OTHER, 0, '')

enum TaskRecordType {
  Date,
}

interface TaskRecord {
  key: string
  type: TaskRecordType
  data: string
}

type TaskRecordArray = TaskRecord[]

export const taskRecordKeyState = atom<TaskRecordKey>({
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

// void Storage.clear()

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
  appendText: (text: string) => void
  getRoot: () => Node
  setRoot: (node: Node) => void
  getNodeByLine: (line: number) => Node
  setNodeByLine: (node: Node, line: number) => void
  addEmptyChild: (line: number) => number
}

export function useTaskManager(): ITaskManager {
  const [root, setRoot] = useRecoilState<Node>(nodeState)
  const setRecordKey = useSetRecoilState(taskRecordKeyState)
  const setIsPossibleToSave = useSetRecoilState(isPossibleToSaveState)
  const { trackings, moveTracking } = useTrackingState()
  const { tags, setTag } = useTagHistory()

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
        Log.d(`removed ${line}`)
        trackings.forEach((n) => {
          if (line < n.line) {
            // Move up
            moveTracking(n.line, n.line - 1)
          }
        })
      }
    }
    setRoot(newRoot)
  }

  const addEmptyChild = (line: number): number => {
    const newRoot = root.appendEmptyTask((node) => node.line === line)
    setRoot(newRoot)
    const parent = newRoot.find((node) => node.line === line)
    const appendLine = parent.children[parent.children.length - 1].line
    Log.d(`add empty ${appendLine}`)
    trackings.forEach((n) => {
      if (appendLine < n.line) {
        // Move down
        moveTracking(n.line, n.line + 1)
      }
    })
    return appendLine
  }

  const tagEq = (a: Tag, b: Tag) => a.name === b.name

  const updateTagHistory = (): void => {
    const tagsA = flatten.reduce((pre, cur) => {
      const data = cur.node.data
      if (hasTags(data)) {
        pre.push(...data.tags)
      }
      return pre
    }, [] as Tag[])
    const newTags = unique(difference(tagsA, tags, tagEq), tagEq)
    newTags.forEach((tag) => {
      setTag({ name: tag.name, colorHex: COLOR.Gray200 })
    })
  }

  updateTagHistory()

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
    appendText: (text: string) => {
      const parsed = Parser.parseMd(text)
      const newRoot = root.append(parsed.children[0])
      setRoot(newRoot)
    },
    getRoot: () => {
      return root
    },
    setRoot: setRoot,
    getNodeByLine,
    setNodeByLine,
    addEmptyChild,
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
          data,
        }
      } else {
        return r
      }
    })
    if (!found) {
      const record = {
        key: key.toKey(),
        type: TaskRecordType.Date,
        data,
      }
      newRecords.push(record)
    }
    setRecords(newRecords)
    await saveRecords(newRecords)
    setSaving(false)
  }
}

export function useTaskRecordKey(): TaskRecordKey {
  return useRecoilValue(taskRecordKeyState)
}

type TaskRecordKeys = [keys: string[]]
export function useTaskRecordKeys(): TaskRecordKeys {
  const records = useRecoilValue(taskRecordsState)
  const keys = records.map((r) => r.key)
  return [keys]
}
