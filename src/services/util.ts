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

// TODO refactoring.
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
      const elm = queue.shift()

      let node: Node
      node = HeadingNode.tryParse(elm)
      if (node) {
        parent.children.push(node)
      } else {
        node = Node.tryParse(elm)
        if (node) {
          parent.children.push(node)
        }
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
