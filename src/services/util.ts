import { Node, NODE_TYPE } from '@/models/node'
import type { TreeItems } from '@/components/Tree/types'
import Log from '@/services/log'

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

export function treeItemsToNode(items: TreeItems): Node {
  const queue: TreeItems = [...items]
  const parent = new Node(NODE_TYPE.ROOT, 0, null)

  try {
    while (queue.length > 0) {
      const elm = queue.shift()
      const node = Node.tryParse(elm)
      if (node) {
        parent.children.push(node)
      }

      if (elm.children.length > 0) {
        node.children = treeItemsToNode(elm.children).children
      }
    }
  } catch (e) {
    Log.e(e)
  }

  return parent
}
