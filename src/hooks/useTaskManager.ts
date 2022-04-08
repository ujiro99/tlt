import { useEffect } from 'react'
import { atom, selector, useRecoilState, useRecoilValue} from 'recoil'
import Log from '@/services/log'
import { STORAGE_KEY, Storage } from '@/services/storage'
import { Parser } from '@/services/parser'
import {
  Node,
  nodeToString,
  clone,
  findNode,
  replaceNode,
  filterNode,
} from '@/models/node'
import { flat } from '@/models/flattenedNode'
import { format } from 'date-fns'

enum TaskRecordType {
  Date,
}

interface TaskRecord {
  key: string
  type: TaskRecordType
  data: string
}

type TaskRecordArray = TaskRecord[]

const keyDate = `${format(new Date(), 'yyyyMMdd')}`

// void Storage.remove(STORAGE_KEY.TASK_LIST_TEXT)

const loadRecords = async (): Promise<TaskRecordArray> => {
  const records =
    ((await Storage.get(STORAGE_KEY.TASK_LIST_TEXT)) as TaskRecordArray) || []
  Log.d(records)
  return records
}

const saveRecords = async (records: TaskRecordArray) => {
   return Storage.set(STORAGE_KEY.TASK_LIST_TEXT, records)
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
  })
})

/**
 * Task text saved in chrome storage.
 */
export const taskRecordSelector = selector<Node>({
  key: 'nodeSelector',
  get: ({ get }) => {
    Log.d(`get nodeSelector`)
    const records = get(taskRecordsState)
    const record = records.find((r) => r.key === keyDate)
    if (record) {
      return Parser.parseMd(record.data)
    } else {
      // If today's task data does not exist,
      // copy the uncompleted data from the most recent past data.
      const lastRecord = records[records.length - 1]
      if (lastRecord) {
        const lastRoot = Parser.parseMd(lastRecord.data)
        return filterNode(lastRoot, (n) => !n.isComplete())
      } else {
        // Nothing to load.
        return Parser.parseMd('')
      }
    }
  },
})

const nodeState = atom<Node>({
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
  getText: () => string
  setText: (value: string) => void
  getTextByLine: (line: number) => string
  setTextByLine: (line: number, text: string) => void
  lineCount: number
  getRoot: () => Node
  getNodeByLine: (line: number) => Node
  setNodeByLine: (node: Node, line: number) => void
  setNode: (node: Node) => void
}
export function useTaskManager(): ITaskManager {
  const [root, setRoot] = useRecoilState(nodeState)

  const flatten = flat(root)

  const getNodeByLine = (line: number): Node | null => {
    return findNode(root, (n) => n.line === line)
  }

  const setNodeByLine = (node: Node, line: number) => {
    const [cloned] = clone([root])
    if (line > flatten.length) {
      node.line = flatten.length + 1
      node.parent = cloned
      cloned.children.push(node)
    } else {
      replaceNode(cloned, node, (n) => n.line === line)
    }
    setRoot(cloned)
  }

  return {
    getText: () => {
      return nodeToString(root)
    },
    setText: (value: string) => {
      const root = Parser.parseMd(value)
      setRoot(root)
    },
    lineCount: flatten.length,
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
    getNodeByLine,
    setNodeByLine,
    setNode: setRoot,
  }
}

export function useTaskStorage(): void {
  const records = useRecoilValue(taskRecordsState)
  const root = useRecoilValue(nodeState)

  useEffect(() => {
    Log.d('root changed')
    saveToStorage()
  }, [root])

  const saveToStorage = () => {
    let found = false
    const newRecords = records.map((r) => {
      if (r.key === keyDate) {
        found = true
        return {
          ...r,
          data: nodeToString(root),
        }
      } else {
        return r
      }
    })
    if (!found) {
      const record = {
        key: keyDate,
        type: TaskRecordType.Date,
        data: '',
      }
      records.push(record)
    }
    void saveRecords(newRecords)
  }
}
