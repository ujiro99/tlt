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
  - [ ] child #dev
    - [x] grandchild #sp:1`
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

  test('type Task with a tag', () => {
    const rootNode = Parser.parseMd('- [ ] task #dev')
    const node = rootNode.children[0]
    expect(node.toString()).toBe('- [ ] task #dev')
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

describe('insertEmptyTask', () => {
  test('Insert a empty task.', () => {
    const root = Parser.parseMd(`# heading
- [ ] task`)
    const ret = root.insertEmptyTask(2)
    const empty = ret.root.children[2]
    expect(empty.toString()).toBe('- [ ] ')
    expect(empty.line).toBe(3)
  })

  test('Insert a Node to the middle of the siblings.', () => {
    const root = Parser.parseMd(`# heading
  - [ ] task 1
  - [ ] task 2`)
    const ret = root.insertEmptyTask(2)
    const empty = ret.root.children[0].children[1]
    expect(empty.toString()).toBe('- [ ] ')
    expect(empty.line).toBe(3)
  })

  test('Insert a Node to last child of the Heading', () => {
    const root = Parser.parseMd(`# heading
  - [ ] task 1`)
    const ret = root.insertEmptyTask(1)
    const empty = ret.root.children[0].children[0]
    expect(empty.toString()).toBe('- [ ] ')
    expect(empty.line).toBe(2)
  })

  test('Insert a Node to last child of parent task', () => {
    const root = Parser.parseMd(`- [ ] task parent
  - [ ] task child 1`)
    const ret = root.insertEmptyTask(1)
    const empty = ret.root.children[0].children[0]
    expect(empty.toString()).toBe('- [ ] ')
    expect(empty.line).toBe(2)
  })
})

describe('appendEmptyTask', () => {
  test('append a empty task.', () => {
    const root = Parser.parseMd(`# heading
- [ ] task`)
    const newRoot = root.appendEmptyTask((n) => n.line === 1)
    const empty = newRoot.children[0].children[0]
    expect(empty.toString()).toBe('- [ ] ')
    expect(empty.line).toBe(2)
    expect(newRoot.children[1].line).toBe(3)
  })

  test('append a empty task as a sibling.', () => {
    const root = Parser.parseMd(`# heading
  - [ ] task`)
    const newRoot = root.appendEmptyTask((n) => n.line === 1)
    const empty = newRoot.children[0].children[1]
    expect(empty.toString()).toBe('- [ ] ')
    expect(empty.line).toBe(3)
    expect(newRoot.children[0].children[0].line).toBe(2)
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

describe('each', () => {
  test('Count nodes using each().', () => {
    const root = Parser.parseMd(`- [ ] task
- [ ] 1
  - [ ] 2
- [ ] 3`)
    let count = 0
    root.each((n) => count++)
    expect(count).toBe(5)
  })
})

describe('replace', () => {
  test('replace a Task', () => {
    let root = Parser.parseMd('- [ ] task')
    const node = Parser.parseMd('- [ ] task1').children[0]
    root = root.replace(node, (n) => n.line === 1)
    expect(nodeToString(root)).toBe('- [ ] task1')
  })

  test('replace a Text', () => {
    let root = Parser.parseMd('text')
    const node = Parser.parseMd('text 1').children[0]
    root = root.replace(node, (n) => n.line === 1)
    expect(nodeToString(root)).toBe('text 1')
  })

  test('replace a Heading', () => {
    let root = Parser.parseMd('# heading')
    const node = Parser.parseMd('# heading 1').children[0]
    root = root.replace(node, (n) => n.line === 1)
    expect(nodeToString(root)).toBe('# heading 1')
  })

  test('replace a Second Heading', () => {
    let root = Parser.parseMd(`# heading
## heading`)
    const node = Parser.parseMd('## heading 1').children[0]
    root = root.replace(node, (n) => n.line === 2)
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

  test('Update line numbers', () => {
    const root = Parser.parseMd(`- [ ] task a
- [x] completed task
- [ ] task b`)
    const filterd = root.filter((n) => !n.isComplete())
    expect(filterd.children[0].line).toBe(1)
    expect(filterd.children[1].line).toBe(2)
  })

  test('If a parent node is deleted, the parent of the child node is replaced by the grandfather.', () => {
    const root = Parser.parseMd(`- [x] task
  - [ ] completed task`)
    const filterd = root.filter((n) => !n.isComplete())
    expect(nodeToString(filterd)).toBe(`- [ ] completed task`)
  })

  test('Remove grandfather node', () => {
    const root = Parser.parseMd(`- [x] task 1
  - [ ] task 2
    - [ ] task 3`)
    const filterd = root.filter((n) => !n.isComplete())
    const ret = nodeToString(filterd)
    const resExpect = `- [ ] task 2\n  - [ ] task 3`
    expect(ret).toBe(resExpect)
  })

  test('Remove a completed task which has a completed child', () => {
    const root = Parser.parseMd(`- [x] task
  - [x] completed task`)
    const filterd = root.filter((n) => !n.isComplete())
    expect(nodeToString(filterd)).toBe(``)
  })
})

describe('isMemberOfHeading', () => {
  test('return false if it is Root', () => {
    const root = Parser.parseMd(`# heading`)
    expect(root.isMemberOfHeading()).toBe(false)
  })

  test('return true if it is Heading', () => {
    const root = Parser.parseMd(`# heading`)
    expect(root.children[0].isMemberOfHeading()).toBe(false)
  })

  test('return true if parent is Heading', () => {
    const root = Parser.parseMd(`# heading
  - [ ] task 1
    - [ ] task 2`)
    expect(root.children[0].children[0].isMemberOfHeading()).toBe(true)
  })

  test('return true if its grandfather is Heading', () => {
    const root = Parser.parseMd(`# heading
  - [ ] task 1
    - [ ] task 2`)
    expect(root.children[0].children[0].children[0].isMemberOfHeading()).toBe(
      true,
    )
  })

  test('return false if', () => {
    const root = Parser.parseMd(`# heading
  - [ ] task 1
    - [ ] task 2 
- [ ] task 3`)
    expect(root.children[1].isMemberOfHeading()).toBe(false)
  })
})
