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
    console.log(rootNode)
    const text = nodeToString(rootNode)
    console.log(text)
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
