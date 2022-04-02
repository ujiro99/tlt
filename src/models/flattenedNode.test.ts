import { flat } from '@/models/flattenedNode'
import { NODE_TYPE } from '@/models/Node'
import { Parser } from '@/services/parser'

describe('flat', () => {
  test('single Task', () => {
    const root = Parser.parseMd('- [ ] task')
    const flatten = flat(root)
    expect(flatten.length).toBe(1)
    expect(flatten[0].node.toString()).toBe('- [ ] task')
  })

  test('empty text', () => {
    const root = Parser.parseMd('')
    const flatten = flat(root)
    expect(flatten.length).toBe(1)
    expect(flatten[0].node.toString()).toBe('')
  })

  test('2 lines', () => {
    const root = Parser.parseMd(`# heading1
  ## heading2`)
    const flatten = flat(root)
    expect(flatten.length).toBe(2)
    expect(flatten[0].node.type).toBe(NODE_TYPE.HEADING)
    expect(flatten[0].node.toString()).toBe('# heading1')
    expect(flatten[1].node.toString()).toBe('## heading2')
    expect(flatten[1].depth).toBe(1)
  })
})
