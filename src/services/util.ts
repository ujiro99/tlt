import { Node, FlattenedNode } from '@/models/node'

/**
 * Stops processing for the specified time.
 * @param {number} msec Sleep time in millisconds
 */
export function sleep(msec: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, msec))
}

/**
 * Convert indent width to margin.
 * @param {number} Number of indent spaces
 * @return margin left.
 */
export function indentToMargin(indent: number): string {
  return `${indent / 4}em`
}

export function flatten(
  nodes: Node[],
  parentId: string | null = null,
  depth = 0,
): FlattenedNode[] {
  return nodes.reduce<FlattenedNode[]>((acc, cur, index) => {
    return [
      ...acc,
      { ...cur, parentId, depth, index } as unknown as FlattenedNode,
      ...flatten(cur.children, cur.id, depth + 1),
    ]
  }, [])
}
