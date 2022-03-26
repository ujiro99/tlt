import { Node, HeadingNode, NODE_TYPE } from '@/models/node'
import { Task } from '@/models/task'
import Log from '@/services/log'
import { getIndentCount } from '@/services/util'

const HEADING_REGEXP = /(#+) (.+)$/
const OTHER_REGEXP = /^ *(.+)$/

export const Parser = {
  parseMd(markdown: string): Node {
    Log.v('start parse')
    const root = new Node(NODE_TYPE.ROOT, 0, null)
    let parent = root
    let level = 0

    const lines = markdown.split(/\n/)
    lines.forEach((val, idx) => {
      try {
        // line number starts from 1.
        const line = idx + 1

        const newLevel = Math.floor(getIndentCount(val) / 2)
        if (level === newLevel) {
          // Insert as a sibling.
          // Do not change parent.
        } else if (level < newLevel) {
          // Insert as a child of the previous element.
          const prev = parent.children[parent.children.length - 1]
          if (prev) parent = prev
        } else if (level > newLevel) {
          // Insert as a child of parent of parent.
          parent = parent.parent
        }
        level = newLevel

        if (Task.isTaskStr(val)) {
          // task
          const task = Task.parse(val)

          const newNode = new Node(NODE_TYPE.TASK, line, task, parent)
          parent.children.push(newNode)
        } else if (HEADING_REGEXP.test(val)) {
          // heading
          const m = HEADING_REGEXP.exec(val)
          const hLevel = m[1].length
          const newNode = new HeadingNode(
            NODE_TYPE.HEADING,
            line,
            m[2],
            hLevel,
            root,
          )
          parent.children.push(newNode)
        } else {
          // other text
          const m = OTHER_REGEXP.exec(val)
          if (m && m.length > 1) val = m[1]
          const newNode = new Node(NODE_TYPE.OTHER, line, val, root)
          parent.children.push(newNode)
        }
      } catch (e) {
        Log.e(e)
      }
    })

    return root
  },
}
