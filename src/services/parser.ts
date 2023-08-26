import { Node, NODE_TYPE } from '@/models/node'
import { Task } from '@/models/task'
import { Group } from '@/models/group'
import Log from '@/services/log'
import { getIndentDepth } from '@/services/util'

const OTHER_REGEXP = /^ *(.+)$/

function parse(text: string): Node {
  Log.v('start parse')
  const root = new Node(NODE_TYPE.ROOT, 0, null)
  let parent = root
  let prevDepth = 0

  const lines = text.split(/\n/)
  if (lines.length === 1 && lines[0].length === 0) {
    return root
  }
  lines.forEach((val, idx) => {
    try {
      // line number starts from 1.
      const line = idx + 1

      const depth = getIndentDepth(val)
      if (prevDepth === depth) {
        // Insert as a sibling.
        // Keep parent.
      } else if (prevDepth < depth) {
        // Insert as a child of the previous element.
        const prev = parent.children[parent.children.length - 1]
        if (prev) parent = prev
      } else if (prevDepth > depth) {
        // Lift up.
        for (let d = prevDepth - depth; d > 0; d--) {
          parent = parent.parent
        }
      }
      prevDepth = depth

      let newNode: Node
      if (Task.test(val)) {
        // task
        const task = Task.parse(val)
        newNode = new Node(NODE_TYPE.TASK, line, task, parent)
      } else if (Group.test(val)) {
        // heading
        const group = Group.parse(val)
        newNode = new Node(NODE_TYPE.HEADING, line, group, parent)
      } else {
        // other text
        const m = OTHER_REGEXP.exec(val)
        if (m && m.length > 1) val = m[1]
        newNode = new Node(NODE_TYPE.OTHER, line, val, parent)
      }
      parent.children.push(newNode)
    } catch (e) {
      Log.e(e)
    }
  })

  return root
}

export const Parser = {
  parseMd(markdown: string): Node {
    return parse(markdown)
  },

  parseArray(textArray: string[]): Node {
    const root = new Node(NODE_TYPE.ROOT, 0, null)
    root.children = textArray.map((txt) => parse(txt))
    return root
  },
}
