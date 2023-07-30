import { useEffect } from 'react'
import { atom, selector, useRecoilState, DefaultValue } from 'recoil'
import { useTagHistory } from '@/hooks/useTagHistory'
import { useTrackingMove } from '@/hooks/useTrackingState'
import { useEventAlarm } from '@/hooks/useEventAlarm'
import { taskRecordKeyState } from '@/hooks/useTaskRecordKey'
import { loadRecords, saveRecords } from '@/hooks/useTaskStorage'
import { Parser } from '@/services/parser'
import { unique, difference } from '@/services/util'
import Log from '@/services/log'
import {
  Node,
  nodeToString,
  setNodeByLine as _setNodeByLine,
} from '@/models/node'
import { Tag, hasTags } from '@/models/tag'
import { flat } from '@/models/flattenedNode'
import { KEY_TYPE } from '@/models/taskRecordKey'
import { TaskRecordKey } from '@/models/taskRecordKey'
import { COLOR } from '@/const'

import { STORAGE_KEY, Storage } from '@/services/storage'

export enum TaskRecordType {
  Date,
}

interface TaskRecord {
  key: string
  type: TaskRecordType
  data: string
}
export type TaskRecordArray = TaskRecord[]

/**
 * All of TaskRecords saved in chrome storage.
 */
export const allRecordsState = atom<TaskRecordArray>({
  key: 'taskRecordsState',
  default: null,
  effects: [
    ({ trigger, setSelf, onSet }) => {
      if (trigger === 'get') {
        setSelf(
          Storage.get(STORAGE_KEY.TASK_LIST_TEXT) as Promise<TaskRecordArray>,
        )
      }

      Storage.addListener(STORAGE_KEY.TASK_LIST_TEXT, (newVal) => {
        setSelf(newVal)
      })

      onSet(async (newVal) => {
        if (newVal instanceof DefaultValue) {
          await Storage.remove(STORAGE_KEY.TASK_LIST_TEXT)
        } else {
          await Storage.set(STORAGE_KEY.TASK_LIST_TEXT, newVal)
        }
      })
    },
  ],
})

export function selectRecord(
  key: TaskRecordKey,
  records: TaskRecordArray,
): Node {
  if (key.keyType === KEY_TYPE.SINGLE) {
    if (records.length === 0) {
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

export const nodeState = atom<Node>({
  key: 'nodeState',
  default: selector({
    key: 'nodeStateSelector',
    get: ({ get }) => {
      const key = get(taskRecordKeyState)
      const records = get(allRecordsState)
      Log.d(`get nodeStateSelector: ${key.toKey()}`)
      return selectRecord(key, records)
    },
  }),
})

const tagEq = (a: Tag, b: Tag) => a.name === b.name

interface ITaskManager {
  lineCount: number
  tags: Tag[]
  getText: () => string
  setText: (value: string) => Node
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
  const { moveTracking } = useTrackingMove()
  const { moveEventLine } = useEventAlarm()
  const { tags, upsertTag } = useTagHistory()

  const flatten = flat(root)

  const move = (from: number, to: number) => {
    moveTracking(from, to)
    moveEventLine(from, to)
  }

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
    let newRoot = _setNodeByLine(root, line, node)
    setRoot(newRoot)

    // if line removed
    if (node == null) {
      Log.d(`remove: ${line}`)
      move(line, null)
    }
  }

  const addEmptyNodeByLine = (line: number): void => {
    Log.d(`insert: ${line + 1}`)
    const newRoot = root.insertEmptyTask(line)
    setRoot(newRoot)
    move(null, line + 1)
  }

  const addEmptyChild = (line: number): number => {
    const newRoot = root.appendEmptyTask((node) => node.line === line)
    setRoot(newRoot)
    const parent = newRoot.find((node) => node.line === line)
    const appendLine = parent.children[parent.children.length - 1].line
    Log.d(`add: ${appendLine}`)
    move(null, line)
    return appendLine
  }

  const removeLine = (line: number) => {
    Log.d(`remove: ${line}`)
    const newRoot = root.filter((n) => n.line !== line)
    setRoot(newRoot)
    move(line, null)
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
      const newRoot = Parser.parseMd(value)
      setRoot(newRoot)
      return newRoot
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
