import { Node, HeadingNode, NODE_TYPE } from '@/models/node'
import type { TreeItems } from '@/components/Tree/types'
import Log from '@/services/log'

/**
 * Stops processing for the specified time.
 * @param {number} msec Sleep time in millisconds
 */
export function sleep(msec: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, msec))
}

function tryParse(obj: unknown): Node | HeadingNode | null {
  let node: Node
  node = HeadingNode.tryParse(obj)
  if (node) {
    return node
  }
  node = Node.tryParse(obj)
  if (node) {
    return node
  }
}

/**
 * Convert TreeItems to Node.
 * @param {TreeItems} items Convertion target.
 */
export function treeItemsToNode(items: TreeItems): Node {
  let queue: TreeItems = [...items]
  let parent = new Node(NODE_TYPE.ROOT, 0, null)
  if (items.length === 1) {
    const node = Node.tryParse(items[0])
    if (node.type === NODE_TYPE.ROOT) {
      parent = node
      queue = [...node.children]
      parent.children = []
    }
  }

  try {
    while (queue.length > 0) {
      const obj = queue.shift()
      const node = tryParse(obj)
      if (node) {
        parent.children.push(node)
        if (obj.children.length > 0) {
          node.children = treeItemsToNode(obj.children).children
        }
      }
    }
  } catch (e) {
    Log.e(e)
  }

  return parent
}

/**
 * Count the number of indents.
 * @param {string} str String to be counted.
 * @return Number of indent spaces.
 */
export function getIndentCount(str: string): number {
  const indentRegexp = /^ +/
  if (indentRegexp.test(str)) {
    const m = indentRegexp.exec(str)
    return m[0].length
  }
  return 0
}
