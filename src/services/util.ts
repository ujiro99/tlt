import React from 'react'
import { format, parseISO } from 'date-fns'
import { Node, NODE_TYPE } from '@/models/node'
import type { TreeItems, FlattenedItem } from '@/components/Tree/types'
import { Task } from '@/models/task'
import { Time } from '@/models/time'
import { Tag } from '@/models/tag'
import Log from '@/services/log'

/**
 * Stops processing for the specified time.
 * @param {number} msec Sleep time in millisconds
 */
export function sleep(msec: number): Promise<void> {
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
 * Count indents.
 * @param {string} str String to be counted.
 * @return Indent spaces.
 */
export function getIndent(str: string): string {
  const indentRegexp = /^ +/
  if (indentRegexp.test(str)) {
    const m = indentRegexp.exec(str)
    return m[0]
  }
  return ''
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

export function formatDaysAgo(
  value: number | string | Date,
  locale: string,
): string {
  const date = new Date(value)
  const deltaDays = (date.getTime() - Date.now()) / (1000 * 3600 * 24)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  return rtf.format(Math.ceil(deltaDays), 'days').replace(' ', '')
}

export function formatTime(dateString: string) {
  return format(parseISO(dateString), 'HH:mm')
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

type Equal<T> = (a: T, b: T) => boolean

export function unique<T>(array: T[], equal?: Equal<T>): T[] {
  if (!equal) equal = (a, b) => a === b
  return array.filter(
    (val, idx, self) => self.findIndex((v) => equal(val, v)) === idx,
  )
}

export function difference<T>(a: T[], b: T[], equal: Equal<T>): T[] {
  return a.filter((va) => b.findIndex((vb) => equal(va, vb)) < 0)
}

export function eventStop(e: React.SyntheticEvent | MouseEvent): void {
  if (e) e.stopPropagation()
}

export function tag2str(tag: Tag): string {
  return tag.quantity ? `${tag.name}:${tag.quantity}` : tag.name
}

export function ifNull(num: number | string, alt = ' - '): number | string {
  if (num) return num
  return alt
}
