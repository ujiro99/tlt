import { treeItemsToNode, moveLine } from './util'
import { Parser } from '@/services/parser'
import { Task } from '@/models/task'
import { Group } from '@/models/group'
import { NODE_TYPE } from '@/models/node'

describe('treeItemsToNode', () => {
  test('to Node', () => {
    const root = Parser.parseMd('- [ ] text')
    const newRoot = treeItemsToNode([root])
    expect(newRoot.children[0].type).toBe(NODE_TYPE.TASK)
    expect(newRoot.children[0].toString()).toBe('- [ ] text')
  })

  test('to HeadingNode', () => {
    const root = Parser.parseMd('# heading')
    const newRoot = treeItemsToNode([root])
    const h1 = newRoot.children[0]
    expect(h1.type).toBe(NODE_TYPE.HEADING)
    expect(h1.toString()).toBe('# heading')
  })

  test('to HeadingNode and Node', () => {
    const root = Parser.parseMd(`# heading
- [ ] text`)
    const newRoot = treeItemsToNode([root])
    expect(newRoot.children[0].type).toBe(NODE_TYPE.HEADING)
    expect((newRoot.children[0].data as Group).title).toBe('heading')
    expect(newRoot.children[1].type).toBe(NODE_TYPE.TASK)
    expect((newRoot.children[1].data as Task).title).toBe('text')
  })

  test('to HeadingNode with Node', () => {
    const root = Parser.parseMd(`# heading
  - [ ] text`)
    const newRoot = treeItemsToNode([root])
    const h1 = newRoot.children[0]
    expect(h1.type).toBe(NODE_TYPE.HEADING)
    expect(h1.toString()).toBe('# heading')
    const task = h1.children[0]
    expect(task.type).toBe(NODE_TYPE.TASK)
    expect(task.toString()).toBe('- [ ] text')
  })

  test('to any string', () => {
    const root = Parser.parseMd('some text')
    const newRoot = treeItemsToNode([root])
    expect(newRoot.children[0].type).toBe(NODE_TYPE.OTHER)
    expect(newRoot.children[0].data).toBe('some text')
  })

  test('to two Heading with Nodes', () => {
    const root = Parser.parseMd(`# heading1
- [ ] task
  - [ ] task2

## heading2
- [ ] task3`)
    const newRoot = treeItemsToNode([root])
    const h1 = newRoot.children[0]
    expect(h1.type).toBe(NODE_TYPE.HEADING)
    expect(h1.toString()).toBe('# heading1')

    const task1 = newRoot.children[1]
    expect(task1.type).toBe(NODE_TYPE.TASK)
    expect(task1.toString()).toBe('- [ ] task')

    const empty = newRoot.children[2]
    expect(empty.type).toBe(NODE_TYPE.OTHER)
    expect(empty.toString()).toBe('')

    const h2 = newRoot.children[3]
    expect(h2.type).toBe(NODE_TYPE.HEADING)
    expect(h2.toString()).toBe('## heading2')
  })
})

const moveLineTable = [
  // move a  line
  [1, 1, 2, 1, 2],
  [2, 1, 2, 1, 1],
  [3, 1, 2, 1, 3],
  [1, 2, 1, 1, 2],
  [2, 2, 1, 1, 1],
  [3, 2, 1, 1, 3],
  // move 2 lines
  [1, 1, 2, 2, 1],
  [2, 1, 2, 2, 2],
  [3, 1, 2, 2, 3],
  [1, 1, 3, 2, 2],
  [2, 1, 3, 2, 3],
  [3, 1, 3, 2, 1],
  [1, 2, 1, 2, 3],
  [2, 2, 1, 2, 1],
  [3, 2, 1, 2, 2],
  // add a line
  [1, null, 1, 1, 2],
  [1, null, 2, 1, 1],
  [2, null, 1, 1, 3],
  // add 2 lines
  [1, null, 1, 2, 3],
  [1, null, 2, 2, 1],
  [2, null, 1, 2, 4],
  // remove a line
  [1, 1, null, 1, null],
  [2, 1, null, 1, 1],
  [2, 1, null, 1, 1],
  [4, 3, null, 1, 3],
  // remove 2 lines
  [1, 1, null, 2, null],
  [2, 1, null, 2, null],
  [3, 1, null, 2, 1],
]

describe.each(moveLineTable)(
  `moveLine`,
  (current: number, from: number, to: number, length: number, ret: number) => {
    test(`${from} -> ${to}, current:${current} length:${length} `, () => {
      expect(moveLine(current, from, to, length)).toBe(ret)
    })
  },
)
