import React from 'react'
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
 * @param rgb RGB color code.
 * @param amount Amount to be varied. -1 ~ 1.
 * @param limit Limits of Change. 0 ~ 255.
 *
 * @return Generated RGB color code.
 *
 * Usage:
 *   // Lighten
 *   var NewColor = LightenDarkenColor("#F06D06", 0.8);
 *   // Darken
 *   var NewColor = LightenDarkenColor("#F06D06", -0.8);
 *
 */
export function lightenDarkenColor(
  rgb: string,
  amount: number,
  limit = 0,
): string {
  let usePound = false
  if (rgb[0] === '#') {
    rgb = rgb.slice(1)
    usePound = true
  }

  const num = parseInt(rgb, 16)
  const upperLimit = 255 - limit
  const lowerLimit = limit
  amount = 255 * amount

  let r = (num >> 16) + amount
  if (r > upperLimit) r = upperLimit
  else if (r < lowerLimit) r = lowerLimit

  let b = ((num >> 8) & 0x00ff) + amount
  if (b > upperLimit) b = upperLimit
  else if (b < lowerLimit) b = lowerLimit

  let g = (num & 0x0000ff) + amount
  if (g > upperLimit) g = upperLimit
  else if (g < lowerLimit) g = lowerLimit

  return (
    (usePound ? '#' : '') +
    (b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')
  )
}

type Equal<T> = (a: T, b: T) => boolean

export function unique<T>(array: T[], equal?: Equal<T>): T[] {
  if (!equal) equal = (a, b) => a === b
  return array.filter(
    (val, idx, self) => self.findIndex((v) => equal(val, v)) === idx,
  )
}

export function difference<T>(a: T[], b: T[], equal: Equal<T>): T[] {
  return a.filter((va) => b.findIndex((vb) => equal(va, vb)) < 0 )
}

export function eventStop(e: React.MouseEvent): void {
  e.stopPropagation()
}
