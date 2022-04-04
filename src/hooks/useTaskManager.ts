import { atom, selector, useRecoilState } from 'recoil'
import Log from '@/services/log'
import { STORAGE_KEY, Storage } from '@/services/storage'
import { Parser } from '@/services/parser'
import { Node, nodeToString, clone, findNode, replaceNode } from '@/models/node'
import { flat } from '@/models/flattenedNode'
import { format } from 'date-fns'

const KeyDatePrefix = 'date-'

const keyDate = `${KeyDatePrefix}${format(new Date(), 'yyyyMMdd')}`

interface TaskStringObject {
  [key: string]: string
}

async function loadData(): Promise<Node> {
  const json = (await Storage.get(STORAGE_KEY.TASK_LIST_TEXT)) as TaskStringObject || {}

  // TODO:
  // If today's task data does not exist,
  // copy the uncompleted data from the most recent past data.
  const todayText = json[keyDate] || ''
  return Parser.parseMd(todayText)
}

async function saveData(
  root: Node,
): Promise<boolean | chrome.runtime.LastError> {
  const json = (await Storage.get(STORAGE_KEY.TASK_LIST_TEXT)) as TaskStringObject || {}
  json[keyDate] = nodeToString(root)
  return Storage.set(STORAGE_KEY.TASK_LIST_TEXT, json)
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
