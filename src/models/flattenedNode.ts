import { Node } from './node'

export class FlattenedNode {
  public node: Node
  public parentId: null | string
  public depth: number

  constructor(node: Node, parentId: string, depth: number) {
    this.node = node
    this.parentId = parentId
    this.depth = depth
  }
}

function flatten(
  items: Node[],
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

export function flat(root: Node): FlattenedNode[] {
  return flatten(root.children)
}

