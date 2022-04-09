import { nodeToString } from '@/models/node'
import { Parser } from '@/services/parser'

describe('nodeToString', () => {
  test('type Task', () => {
    const rootNode = Parser.parseMd('- [ ] task')
    const text = nodeToString(rootNode)
    expect(text).toBe('- [ ] task')
  })

  test('type Heading', () => {
    const rootNode = Parser.parseMd('# heading')
    const text = nodeToString(rootNode)
    expect(text).toBe('# heading')
  })

  test('type Text', () => {
    const rootNode = Parser.parseMd('some text')
    const text = nodeToString(rootNode)
    expect(text).toBe('some text')
  })

  test('nested task', () => {
    const expectStr = `- [ ] parent
  - [ ] child`
    const rootNode = Parser.parseMd(expectStr)
    const text = nodeToString(rootNode)
    expect(text).toBe(expectStr)
  })

  test('nested task 2 level', () => {
    const expectStr = `- [ ] parent
  - [ ] child
    - [x] grandchild`
    const rootNode = Parser.parseMd(expectStr)
    const text = nodeToString(rootNode)
    expect(text).toBe(expectStr)
  })

  test('nested heading and tasks', () => {
    const expectStr = `# heading1
  - [ ] child
    - [x] grandchild
    ## heading2
      some text
      - [ ] task`
    const rootNode = Parser.parseMd(expectStr)
    const text = nodeToString(rootNode)
    expect(text).toBe(expectStr)
  })
})

describe('toString', () => {
  test('type Task', () => {
    const rootNode = Parser.parseMd('- [ ] task')
    const node = rootNode.children[0]
    expect(node.toString()).toBe('- [ ] task')
  })

  test('type Heading', () => {
    const rootNode = Parser.parseMd('# heading')
    const node = rootNode.children[0]
    expect(node.toString()).toBe('# heading')
  })

  test('type Text', () => {
    const rootNode = Parser.parseMd('some text')
    const node = rootNode.children[0]
    expect(node.toString()).toBe('some text')
  })
})

describe('find', () => {
  test('find a first node.', () => {
    const root = Parser.parseMd(`- [ ] task
- [ ] another task`)
    const node = root.find((n) => n.line === 1)
    expect(node.toString()).toBe('- [ ] task')
  })
})

describe('replace', () => {
  test('replace a Task', () => {
    const root = Parser.parseMd('- [ ] task')
    const node = Parser.parseMd('- [ ] task1').children[0]
    root.replace(node, (n) => n.line === 1)
    expect(nodeToString(root)).toBe('- [ ] task1')
  })

  test('replace a Text', () => {
    const root = Parser.parseMd('text')
    const node = Parser.parseMd('text 1').children[0]
    root.replace(node, (n) => n.line === 1)
    expect(nodeToString(root)).toBe('text 1')
  })

  test('replace a Heading', () => {
    const root = Parser.parseMd('# heading')
    const node = Parser.parseMd('# heading 1').children[0]
    root.replace(node, (n) => n.line === 1)
    expect(nodeToString(root)).toBe('# heading 1')
  })

  test('replace a Second Heading', () => {
    const root = Parser.parseMd(`# heading
## heading`)
    const node = Parser.parseMd('## heading 1').children[0]
    root.replace(node, (n) => n.line === 2)
    expect(nodeToString(root)).toBe(`# heading
## heading 1`)
  })
})

describe('filter', () => {
  test('Remove a completed task', () => {
    const root = Parser.parseMd(`- [ ] task
- [x] completed task`)
    const filterd = root.filter((n) => !n.isComplete())
    expect(nodeToString(filterd)).toBe('- [ ] task')
  })

  test('Don\'t remove a completed task which has a child', () => {
    const root = Parser.parseMd(`- [x] task
  - [ ] completed task`)
    const filterd = root.filter((n) => !n.isComplete())
    expect(nodeToString(filterd)).toBe(`- [x] task
  - [ ] completed task`)
  })

  test('Remove a completed task which has a completed child', () => {
    const root = Parser.parseMd(`- [x] task
  - [x] completed task`)
    const filterd = root.filter((n) => !n.isComplete())
    expect(nodeToString(filterd)).toBe(``)
  })
})
