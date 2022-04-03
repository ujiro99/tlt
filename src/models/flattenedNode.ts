import { INode } from './node'

export class FlattenedNode {
  public node: INode
  public parentId: null | string
  public depth: number

  constructor(node: INode, parentId: string, depth: number) {
    this.node = node
    this.parentId = parentId
    this.depth = depth
  }
}

function flatten(
  items: INode[],
  parentId: string | null = null,
  depth = 0,
): FlattenedNode[] {
  return items.reduce<FlattenedNode[]>((acc, item) => {
    return [
      ...acc,
      new FlattenedNode(item, parentId, depth),
      ...flatten(item.children, item.id, depth + 1),
    ]
  }, [])
}

export function flat(root: INode): FlattenedNode[] {
  if (!root) return []
  return flatten(root.children)
}

