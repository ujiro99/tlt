import { Node, HeadingNode, NODE_TYPE } from '@/models/node'
import { Task } from '@/models/task'
import Log from '@/services/log'

const HEADING_REGEXP = /^(#+) (.+)$/

export const Parser = {
  parseMd(markdown: string): Node {
    Log.d('start parse')
    const root = new Node(NODE_TYPE.ROOT, 0, null)
    let parent = root
    let level = 0

    const lines = markdown.split(/\n/)
    lines.forEach((val, idx) => {
      // line number starts from 1.
      const line = idx + 1
      if (Task.isTaskStr(val)) {
        // task
        const task = Task.parse(val)
        const newLevel = Math.floor(task.indent / 2)

        if (level === newLevel) {
          // Insert as a sibling.
          const newNode = new Node(NODE_TYPE.TASK, line, task, parent)
          parent.children.push(newNode)
        } else if (level < newLevel) {
          // Insert as a child of the previous element.
          const prev = parent.children[parent.children.length - 1]
          if (prev && prev.type === NODE_TYPE.TASK) parent = prev

          const newNode = new Node(NODE_TYPE.TASK, line, task, parent)
          parent.children.push(newNode)
          level = newLevel
        } else if (level > newLevel) {
          // Insert as a child of parent of parent.
          parent = parent.parent
          const newNode = new Node(NODE_TYPE.TASK, line, task, parent)
          parent.children.push(newNode)
          level = newLevel
        }
      } else if (HEADING_REGEXP.test(val)) {
        // heading
        const m = HEADING_REGEXP.exec(val)
        const hLevel = m[1].length
        const newNode = new HeadingNode(NODE_TYPE.HEADING, line, m[2], hLevel, root)
        root.children.push(newNode)
        parent = newNode
        level = 0
      } else {
        // other text
        const newNode = new Node(NODE_TYPE.OTHER, line, val, parent)
        parent.children.push(newNode)
        level = 0
      }
    })

    return root
  },
}
