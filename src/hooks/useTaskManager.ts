import { atom, selector, useRecoilState } from 'recoil'
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

async function loadData(): Promise<Node> {
  const records =
    ((await Storage.get(STORAGE_KEY.TASK_LIST_TEXT)) as TaskRecordArray) || []
  Log.d(records)

  const record = records.find((r) => r.key === keyDate)
  if (record) {
    return Parser.parseMd(record.data)
  } else {
    // If today's task data does not exist,
    // copy the uncompleted data from the most recent past data.
    const lastRecord = records.pop()
    if (lastRecord) {
      const lastRoot = Parser.parseMd(lastRecord.data)
      return filterNode(lastRoot, (n) => !n.isComplete())
    } else {
      // Nothing to load.
      return Parser.parseMd('')
    }
  }
}

async function saveData(
  root: Node,
): Promise<boolean | chrome.runtime.LastError> {
  const records =
    ((await Storage.get(STORAGE_KEY.TASK_LIST_TEXT)) as TaskRecordArray) || []
  let record = records.find((r) => r.key === keyDate)
  if (!record) {
    record = {
      key: keyDate,
      type: TaskRecordType.Date,
      data: '',
    }
    records.push(record)
  }
  record.data = nodeToString(root)
  return Storage.set(STORAGE_KEY.TASK_LIST_TEXT, records)
}

/**
 * Task text saved in chrome storage.
 */
export const nodeState = atom({
  key: 'nodeState',
  default: selector({
    key: 'nodeStateSelctor',
    get: async () => {
      return await loadData()
    },
  }),
  effects_UNSTABLE: [
    ({ onSet }) => {
      onSet((root: Node) => {
        Log.d(`onSet nodeState`)
        void saveData(root)
      })
    },
  ],
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
  const [root, setNode] = useRecoilState(nodeState)

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
    setNode(cloned)
  }

  return {
    getText: () => {
      return nodeToString(root)
    },
    setText: (value: string) => {
      const root = Parser.parseMd(value)
      setNode(root)
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
    setNode: setNode,
  }
}
