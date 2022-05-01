import { format } from 'date-fns'
import { Node, NODE_TYPE } from '@/models/node'
import type { TreeItems, FlattenedItem } from '@/components/Tree/types'
import { Task } from '@/models/task'
import { Time } from '@/models/time'
import Log from '@/services/log'

/**
 * Stops processing for the specified time.
 * @param {number} msec Sleep time in millisconds
 */
export function sleep(msec: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, msec))
}

function tryParse(obj: unknown): Node | null {
  const node = Node.tryParse(obj)
  if (node) {
    return node
  }
}

export function updateLines(items: FlattenedItem[]): FlattenedItem[] {
  return items.map((i, idx) => {
    ;(i as unknown as Node).line = idx + 1
    return i
  })
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

/**
 * Convert a date to the key of TaskRecord.
 * @param {Date} date A date to be converted.
 * @return Key of TaskRecord.
 */
export function dateToKey(date: Date): string {
  return `${format(date, 'yyyyMMdd')}`
}

/**
 * Returns a bar made of ASCII art.
 */
export function asciiBar(percentage: number, length = 20, box = true): string {
  const fillNum = Math.floor(percentage / (100 / length))
  if (fillNum >= length) return ''.padEnd(length, '█')
  if (box) {
    return ''.padEnd(fillNum, '█').padEnd(length, '▁')
  } else {
    return ''.padEnd(fillNum, '█')
  }
}

type TimeTotal = {
  actual: Time
  estimate: Time
  percentage: number
}

function zero() {
  return new Time()
}

/**
 * Calculate the total time.
 */
export function aggregate(tasks: Task[]): TimeTotal {
  const actual = tasks.reduce((a, c) => a.add(c.actualTimes), zero())
  const estimate = tasks.reduce((a, c) => a.add(c.estimatedTimes), zero())
  const percentage = Math.floor(actual.divide(estimate) * 100)
  return {
    actual,
    estimate,
    percentage,
  }
}

/**
 * Generate lightened or darkened colors.
 *
 * @param {string} color RGB color code.
 * @param {number} amount Amount to be varied. -255 ~ 255.
 * @return {string} Generated RGB color code.
 *
 * Usage:
 *   // Lighten
 *   var NewColor = LightenDarkenColor("#F06D06", 20);
 *   // Darken
 *   var NewColor = LightenDarkenColor("#F06D06", -20);
 *
 */
export function lightenDarkenColor(color: string, amount: number): string {
  let usePound = false
  if (color[0] === '#') {
    color = color.slice(1)
    usePound = true
  }

  const num = parseInt(color, 16)

  let r = (num >> 16) + amount
  if (r > 255) r = 255
  else if (r < 0) r = 0

  let b = ((num >> 8) & 0x00ff) + amount
  if (b > 255) b = 255
  else if (b < 0) b = 0

  let g = (num & 0x0000ff) + amount
  if (g > 255) g = 255
  else if (g < 0) g = 0

  return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16)
}
