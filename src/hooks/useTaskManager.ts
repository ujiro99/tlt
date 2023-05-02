import { useEffect } from 'react'
import { atom, selector, useRecoilState } from 'recoil'
import { useTagHistory } from '@/hooks/useTagHistory'
import { useTrackingMove } from '@/hooks/useTrackingState'
import { taskRecordKeyState } from '@/hooks/useTaskRecordKey'
import { Node, nodeToString } from '@/models/node'
import { Tag, hasTags } from '@/models/tag'
import { flat } from '@/models/flattenedNode'
import { KEY_TYPE } from '@/models/taskRecordKey'
import { STORAGE_KEY, Storage } from '@/services/storage'
import { Parser } from '@/services/parser'
import { unique, difference } from '@/services/util'
import Log from '@/services/log'
import { COLOR } from '@/const'
import { TaskRecordKey } from '@/models/taskRecordKey'

export enum TaskRecordType {
  Date,
}

interface TaskRecord {
  key: string
  type: TaskRecordType
  data: string
}
export type TaskRecordArray = TaskRecord[]

// void Storage.clear()

const loadRecords = async (): Promise<TaskRecordArray> => {
  const records =
    ((await Storage.get(STORAGE_KEY.TASK_LIST_TEXT)) as TaskRecordArray) || []
  Log.d(records)
  return records
}

/**
 * All of TaskRecords saved in chrome storage.
 */
export const allRecordsState = atom({
  key: 'taskRecordsState',
  default: selector({
    key: 'nodeStateSelctor',
    get: async () => {
      Log.d(`get taskRecordsState`)
      return await loadRecords()
    },
  }),
})

export function selectRecord(
  key: TaskRecordKey,
  records: TaskRecordArray,
): Node {
  if (key.keyType === KEY_TYPE.SINGLE) {
    if (records.length === 0)  {
      // empty state
      const emptyState =
        '# Welcome to TLT !\n  - [ ] This is sample todo ~/1h\n  - [ ] Double click to edit ~/2h #tag'
      const root = Parser.parseMd(emptyState)
      return root
    }

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
}

/**
 * Task text saved in chrome storage.
 */
const taskRecordSelector = selector<Node>({
  key: 'taskRecordSelector',
  get: ({ get }) => {
    const key = get(taskRecordKeyState)
    const records = get(allRecordsState)
    Log.d(`get taskRecordSelector: ${key.toKey()}`)
    return selectRecord(key, records)
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

const tagEq = (a: Tag, b: Tag) => a.name === b.name

interface ITaskManager {
  lineCount: number
  tags: Tag[]
  getText: () => string
  setText: (value: string) => void
  getTextByLine: (line: number) => string
  setTextByLine: (line: number, text: string) => void
  getRoot: () => Node
  setRoot: (node: Node) => void
  getNodeByLine: (line: number) => Node
  setNodeByLine: (node: Node, line: number) => void
  addEmptyNodeByLine: (line: number) => void
  addEmptyChild: (line: number) => number
  removeLine: (line: number) => void
}

export function useTaskManager(): ITaskManager {
  const [root, setRoot] = useRecoilState<Node>(nodeState)
  const { trackings, moveTracking } = useTrackingMove()
  const { tags, upsertTag } = useTagHistory()

  const flatten = flat(root)

  const tagsInState = flatten.reduce((pre, crr) => {
    const data = crr.node.data
    if (hasTags(data)) {
      pre.push(...data.tags)
    }
    return pre
  }, [] as Tag[])

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
    setRoot(newRoot)
  }

  const addEmptyNodeByLine = (line: number): void => {
    const newRoot = root.insertEmptyTask(line)
    setRoot(newRoot)
    Log.d(`add empty ${line}`)
    trackings.forEach((n) => {
      if (line < n.line) {
        // Move down
        moveTracking(n.line, n.line + 1)
      }
    })
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

  const removeLine = (line: number) => {
    const newRoot = root.filter((n) => n.line !== line)
    setRoot(newRoot)
    trackings.forEach((t) => {
      if (line < t.line) {
        // Move up
        moveTracking(t.line, t.line - 1)
      }
    })
  }

  const updateTagHistory = (): void => {
    const newTags = unique(difference(tagsInState, tags, tagEq), tagEq)
    newTags.forEach((tag) => {
      upsertTag({ name: tag.name, colorHex: COLOR.Gray200 })
    })
  }

  useEffect(() => {
    updateTagHistory()
  }, [tagsInState, tags])

  return {
    lineCount: flatten.length,
    tags: tagsInState,
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
    setRoot,
    getNodeByLine,
    setNodeByLine,
    addEmptyNodeByLine,
    addEmptyChild,
    removeLine,
  }
}
