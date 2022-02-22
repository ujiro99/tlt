import { Task } from '@/models/task'

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

export class Node {
  public type: NodeType
  public line: number
  public data: Task | string
  public parent: Node
  public children: Node[]

  private _id: string

  public constructor(
    type: NodeType,
    line: number,
    data: Task | string,
    parent?: Node,
  ) {
    this.type = type
    this.line = line
    this.data = data
    this.parent = parent
    this.children = [] as Node[]
    this._id = `${Math.random()}`
  }

  public get id(): string {
    return this._id
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
}

export interface FlattenedNode extends Node {
  parentKey: null | string
  depth: number
  index: number
}
