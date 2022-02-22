import { Node } from '@/models/node'

export interface FlattenedNode extends Node {
  parentId: null | string
  depth: number
  index: number
}
