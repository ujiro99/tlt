import { TreeItem } from '@/components/Tree/types'
import { Task } from '@/models/task'
import { Group } from '@/models/group'
import Log from '@/services/log'
import { rand, depthToIndent } from '@/services/util'
import { flat } from './flattenedNode'
import { IClonable } from '@/@types/global'
import { DEFAULT } from '@/const'

/**
 * Represent types of the Node.
 */
export const NODE_TYPE = {
  TASK: 'TASK',
  HEADING: 'HEADING',
  OTHER: 'OTHER',
  ROOT: 'ROOT',
}
type NodeType = (typeof NODE_TYPE)[keyof typeof NODE_TYPE]

/**
 * @see https://qiita.com/SoraKumo/items/1d593796de973095f101
 */
function hasProperties<K extends string>(
  x: unknown,
  ...name: K[]
): x is { [M in K]: unknown } {
  return x instanceof Object && name.every((prop) => prop in x)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isClonable<T>(arg: any): arg is IClonable<T> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return arg && arg.clone !== undefined
}

export interface INode {
  type: NodeType
  line: number
  data: Task | Group | string
  parent: Node
  children: Node[]
  id: string

  toString(): string
  clone(): INode
}

type Predicate = (n: Node) => boolean

export class Node implements TreeItem, INode, IClonable<INode> {
  public type: NodeType
  public line: number
  public data: Task | Group | string
  public parent: Node
  public children: Node[]
  public collapsed: boolean
  public id: string

  public static tryParse(obj: unknown): Node | null {
    if (
      hasProperties(obj, 'type', 'line', 'data', 'parent', 'children', 'id')
    ) {
      const type = obj.type as NodeType
      const line = obj.line as number
      const data = obj.data as string
      const parent = obj.parent as Node

      const node = new Node(type, line, data, parent)
      const children = obj.children as Array<Node>
      node.children.push(...children)
      node.id = obj.id as string
      return node
    } else {
      return null
    }
  }

  public constructor(
    type: NodeType,
    line: number,
    data: Task | Group | string,
    parent?: Node,
  ) {
    this.id = rand()
    this.type = type
    this.line = line
    this.data = data
    this.parent = parent
    this.children = [] as Node[]
  }

  public toString(): string {
    if (this.type === NODE_TYPE.ROOT) return ''
    return this.data.toString()
  }

  public clone(): Node {
    const c = new Node(this.type, this.line, this.data, this.parent)
    c.id = this.id
    c.children = [...this.children]
    c.collapsed = this.collapsed
    if (isClonable(this.data)) {
      c.data = this.data.clone()
    }
    return c
  }

  public isComplete(): boolean {
    if (this.type === NODE_TYPE.TASK) {
      return (this.data as Task).isComplete()
    }
    return false
  }

  public isRoot(): boolean {
    return this.type === NODE_TYPE.ROOT
  }

  public isHeading(): boolean {
    return this.type === NODE_TYPE.HEADING
  }

  public isMemberOfHeading(): boolean {
    if (this.isRoot()) return false
    if (this.parent.isHeading()) return true
    return this.parent.isMemberOfHeading()
  }

  public append(node: Node): Node {
    const [cloned] = clone([this])
    const flatten = flat(this)
    node.line = flatten.length + 1
    node.parent = cloned
    cloned.children.push(node)
    return cloned
  }

  public insertEmptyTask(line: number): Node {
    const [cloned] = clone([this])
    const found = cloned.find((n) => n.line === line)
    if (found) {
      const empty = new Node(NODE_TYPE.TASK, 0, Task.parse(DEFAULT))
      if (found.type === NODE_TYPE.HEADING) {
        empty.parent = found
        found.children.unshift(empty)
      } else {
        empty.parent = found.parent
        const idx = found.parent.children.findIndex((n) => n.id === found.id)
        found.parent.children.splice(idx + 1, 0, empty)
      }
    }
    updateLineNumber(cloned)
    return cloned
  }

  public appendEmptyTask(predicate: Predicate): Node {
    let cloned: Node
    const parent = this.find(predicate)
    if (parent) {
      const empty = new Node(NODE_TYPE.TASK, 0, Task.parse(DEFAULT))
      const newParent = parent.append(empty)
      cloned = this.replace(newParent, (n) => n.id === parent.id, false)
    }
    updateLineNumber(cloned)
    return cloned
  }

  public find(predicate: Predicate): Node | null {
    const queue: Node[] = [this]

    // breadth first search
    try {
      while (queue.length > 0) {
        const elm = queue.shift()
        if (predicate(elm)) {
          return elm
        }
        if (elm.children.length > 0) {
          queue.push(...elm.children)
        }
      }
    } catch (e) {
      Log.w(e)
    }
    return null
  }

  public filter(predicate: Predicate): Node {
    const [cloned] = clone([this])
    const queue: Node[] = [cloned]
    const flatten: Node[] = []

    // breadth first search
    try {
      while (queue.length > 0) {
        const elm = queue.shift()
        flatten.push(elm)
        if (elm.children.length > 0) {
          queue.push(...elm.children)
        }
      }

      const reverse = flatten.reverse()

      // Remove nodes
      reverse.forEach((n) => {
        const match = predicate(n)
        if (!match) {
          // remove a node
          const parent = n.parent
          const idx = parent.children.findIndex((c) => c.id === n.id)
          parent.children = parent.children.filter((c) => c.id !== n.id)

          if (n.children.length > 0) {
            // replace a parent node
            parent.children.splice(idx, 0, ...n.children)
            n.children.forEach((c) => (c.parent = parent))
          }
        }
      })

      // Update line number
      updateLineNumber(cloned)
    } catch (e) {
      Log.w(e)
    }

    return cloned
  }

  public replace(node: Node, predicate: Predicate, keepChildren = true): Node {
    const [cloned] = clone([this])
    const target = cloned.find(predicate)
    if (target == null) return cloned
    const parent = target.parent
    if (parent == null) return cloned

    // keep some data of the node.
    node.id = target.id
    node.line = target.line
    node.parent = parent
    if (keepChildren) {
      node.children = target.children
    }

    parent.children = parent.children.map((n) => {
      return n.id === node.id ? node : n
    })

    return cloned
  }
}

function clone(nodes: Node[], parent?: Node): Node[] {
  return nodes.map<Node>((a) => {
    const b = a.clone()
    b.parent = parent
    b.children = clone(b.children, b)
    return b
  })
}

/**
 * Update line number
 */
function updateLineNumber(root: Node): void {
  const flatten = flat(root)
  flatten.forEach((f, index) => {
    f.node.line = index + 1
  })
}

export function nodeToString(root: Node): string {
  const flatten = flat(root)
  const lines = flatten.map((item) => {
    if (item.node.type === NODE_TYPE.TASK) {
      let task = item.node.data as Task
      task = task.clone()
      item.node = item.node.clone()
      item.node.data = task
    }
    const indent = depthToIndent(item.depth)
    return `${indent}${item.node.toString()}`
  })

  return lines.join('\n')
}

export function nodeToTasks(root: INode, completed: boolean): Task[] {
  let tasks: Task[] = flat(root)
    .filter((n) => n.node.type === NODE_TYPE.TASK)
    .map((n) => n.node.data) as Task[]
  if (completed) {
    tasks = tasks.filter((t) => t.isComplete())
  }
  return tasks
}

export function setNodeByLine(root: Node, line: number, node: Node): Node {
  let newRoot: Node
  if (line > flat(root).length) {
    newRoot = root.append(node)
  } else if (node) {
    newRoot = root.replace(node, (n) => n.line === line)
  } else {
    // remove this line
    newRoot = root.filter((n) => n.line !== line)
  }
  return newRoot
}
