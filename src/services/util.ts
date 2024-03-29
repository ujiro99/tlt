import React from 'react'
import { format, parseISO } from 'date-fns'
import type { TreeItems } from '@/components/Tree/types'
import { Node, NODE_TYPE } from '@/models/node'
import { flat } from '@/models/flattenedNode'
import { Task } from '@/models/task'
import { Time } from '@/models/time'
import { Tag } from '@/models/tag'
import Log from '@/services/log'
import { INDENT_SIZE } from '@/const'

/**
 * Stops processing for the specified time.
 * @param {number} msec Sleep time in millisconds
 */
export function sleep(msec: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, msec))
}

/**
 * Calculation of line movement
 *
 * @param current Current line number.
 * @param from Line number from which to move.
 * @param to Destination line number.
 * @param length Number of lines to move.
 *
 * @returns Line number after move.
 */
export function moveLine(
  current: number,
  from: number,
  to: number,
  length: number,
): number {
  // -----
  // add
  // -----
  if (from == null) {
    if (current >= to) {
      // Move down
      return current + length
    }
    return current
  }

  // -----
  // remove
  // -----
  if (to == null) {
    //       1. no change
    // from
    //       2. remove togher
    // from + length
    //       3. move up

    if (from <= current && current < from + length) {
      // 2. remove togher
      return null
    }
    if (from + length - 1 < current) {
      // 3. Move up
      return current - length
    }
    return current
  }

  // -----
  // move
  // -----
  if (from < to && from + length - 1 >= to) {
    // The operation to move within oneself is invalid.
    return current
  }
  if (current === from) {
    // From -> to
    if (from < to) {
      return to - (length - 1)
    } else {
      return to
    }
  }

  if (from > to) {
    // Lines move up

    //       1. no change
    // to
    //       2. move down
    // from
    //       3. move up togher
    // from + length
    //       4. no change

    if (current < to) {
      // 1. no change
      return current
    }
    if (current < from) {
      // 2. move down
      return current + length
    }
    if (current <= from + length - 1) {
      // 3. move up togher
      return to + (current - from)
    }
    // 4. no change
    return current
  }

  if (from < current && current <= to) {
    // Lines move down
    if (current < from + length) {
      // moves together
      return to + current - from - length + 1
    }
    return current - length
  }

  return current
}

export function updateLines(root: Node): Node {
  const flatten = flat(root)
  flatten.forEach((f, index) => {
    f.node.line = index + 1
  })
  return root
}

/**
 * Convert TreeItems to Node.
 * @param {TreeItems} items Convertion target.
 */
export function treeItemsToNode(items: TreeItems): Node {
  let parent = new Node(NODE_TYPE.ROOT, 0, null)
  let queue: TreeItems = [...items]

  // for ROOT
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
      const node = Node.tryParse(obj)
      if (node) {
        parent.children.push(node)
        node.parent = parent
        if (hasProperties(obj, 'collapsed')) {
          node.collapsed = obj.collapsed
        }
        if (obj.children.length > 0) {
          node.children = treeItemsToNode(obj.children).children
          node.children.forEach((c) => (c.parent = node))
        }
      }
    }
  } catch (e) {
    Log.e(e)
  }

  return parent
}

/**
 * Count the depth of indents.
 * @param {string} str String to be counted.
 * @return Number of indent spaces.
 */
export function getIndentDepth(str: string): number {
  const indentRegexp = /^ +/
  if (indentRegexp.test(str)) {
    const m = indentRegexp.exec(str)
    return Math.floor(m[0].length / INDENT_SIZE)
  }
  return 0
}

/**
 * Get indent spaces.
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

export function depthToIndent(depth: number): string {
  return ''.padStart(depth * INDENT_SIZE, ' ')
}

/**
 * Convert a date to the key of TaskRecord.
 * @param date A date to be converted.
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

export function formatTime(date: string | number) {
  if (typeof date === 'number') {
    return format(new Date(date), 'HH:mm')
  }
  return format(parseISO(date), 'HH:mm')
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

/**
 * Return the number as a zero-padded string.
 */
export function pad(num: number, len: number): string {
  return `${num}`.padStart(len, '0')
}

/**
 * Generate a random string.
 * @returns random string
 */
export function rand(): string {
  return Math.random().toString(36).slice(2)
}

/**
 * Scroll to the element.
 * @param elm Scroll target element.
 * @param offset Offset from the top of the element. [px]
 * @see https://stackoverflow.com/questions/49820013/javascript-scrollintoview-smooth-scroll-and-offset
 */
export function scrollTo(elm: Element, offset = 0): void {
  const elementPosition = elm.getBoundingClientRect().top
  const offsetPosition = elementPosition + window.pageYOffset - offset

  document.getElementsByClassName('simplebar-content-wrapper')[0].scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  })
}

/**
 * @see https://qiita.com/SoraKumo/items/1d593796de973095f101
 */
export function hasProperties<K extends string>(
  x: unknown,
  ...name: K[]
): x is { [M in K]: unknown } {
  return x instanceof Object && name.every((prop) => prop in x)
}
