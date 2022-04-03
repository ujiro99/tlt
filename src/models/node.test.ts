import { nodeToString, findNode, replaceNode } from '@/models/node'
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

describe('findNode', () => {
  test('find a first node.', () => {
    const root = Parser.parseMd('- [ ] task')
    const node = findNode(root, (n) => n.line === 1)
    expect(node.toString()).toBe('- [ ] task')
  })
})

describe('replaceNode', () => {
  test('replace a Task', () => {
    const root = Parser.parseMd('- [ ] task')
    const node = Parser.parseMd('- [ ] task1').children[0]
    replaceNode(root, node, (n) => n.line === 1)
    expect(nodeToString(root)).toBe('- [ ] task1')
  })

  test('replace a Text', () => {
    const root = Parser.parseMd('text')
    const node = Parser.parseMd('text 1').children[0]
    replaceNode(root, node, (n) => n.line === 1)
    expect(nodeToString(root)).toBe('text 1')
  })

  test('replace a Heading', () => {
    const root = Parser.parseMd('# heading')
    const node = Parser.parseMd('# heading 1').children[0]
    replaceNode(root, node, (n) => n.line === 1)
    expect(nodeToString(root)).toBe('# heading 1')
  })

  test('replace a Second Heading', () => {
    const root = Parser.parseMd(`# heading
## heading`)
    const node = Parser.parseMd('## heading 1').children[0]
    replaceNode(root, node, (n) => n.line === 2)
    expect(nodeToString(root)).toBe(`# heading
## heading 1`)
  })
})
