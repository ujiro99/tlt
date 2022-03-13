import { TreeItem } from '@/components/Tree/types'
import { Task } from '@/models/task'
import Log from '@/services/log'

/**
 * Represent types of the Node.
 */
export const NODE_TYPE = {
  TASK: 'TASK',
  HEADING: 'HEADING',
  OTHER: 'OTHER',
  ROOT: 'ROOT',
}
type NodeType = typeof NODE_TYPE[keyof typeof NODE_TYPE]

/**
 * @see https://qiita.com/SoraKumo/items/1d593796de973095f101
 */
function hasProperties<K extends string>(
  x: unknown,
  ...name: K[]
): x is { [M in K]: unknown } {
  return x instanceof Object && name.every((prop) => prop in x)
}

export class Node implements TreeItem {
  public type: NodeType
  public line: number
  public data: Task | string
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
    data: Task | string,
    parent?: Node,
  ) {
    this.id = `${Math.random()}`
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
    return c
  }
}

export class HeadingNode extends Node {
  public level: number
  public data: string

  public constructor(
    type: NodeType,
    line: number,
    data: string,
    level: number,
    parent?: Node,
  ) {
    super(type, line, data, parent)
    this.level = level
  }

  public toString(): string {
    return ''.padStart(this.level, '#') + ' ' + this.data
  }
}

export function flat(nodes: Node[]): Node[] {
  return nodes.reduce<Node[]>((acc, cur) => {
    return [...acc, cur, ...flat(cur.children)]
  }, [])
}

export function clone(nodes: Node[]): Node[] {
  return nodes.map<Node>((a) => {
    const b = a.clone()
    b.children = clone(b.children)
    return b
  })
}

type Predicate = (n: Node) => boolean

export function findNode(root: Node, predicate: Predicate): Node | null {
  const queue: Node[] = [root]

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

export function replaceNode(
  root: Node,
  node: Node,
  predicate: Predicate,
): void {
  const target = findNode(root, predicate)
  if (target == null) return
  const parent = target.parent
  if (parent == null) return

  // keep some data of the node.
  node.id = target.id
  node.line = target.line
  node.parent = parent

  parent.children = parent.children.map((n) => {
    return (n.id === target.id) ? target : n
  })
}

export function nodeToString(root: Node | Node[]): string {
  const queue: Node[] = []
  const lines = []

  if (Array.isArray(root)) {
    queue.unshift(...root)
  } else {
    if (root.type === NODE_TYPE.ROOT) {
      queue.unshift(...root.children)
    } else {
      queue.unshift(root)
    }
  }

  try {
    while (queue.length > 0) {
      const elm = queue.shift()
      lines.push(elm.toString())
      if (elm.children.length > 0) {
        queue.unshift(...elm.children)
      }
    }
  } catch (e) {
    Log.w(e)
  }

  return lines.join('\n')
}
