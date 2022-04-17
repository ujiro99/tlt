import { Parser } from '@/services/parser'
import { NODE_TYPE } from '@/models/node'
import { Task } from '@/models/task'
import { Group } from '@/models/group'

describe('parserMd', () => {
  test('parse a task', () => {
    const rootNode = Parser.parseMd('- [ ] task')
    expect(rootNode.type).toBe(NODE_TYPE.ROOT)
    expect(rootNode.children[0].type).toBe(NODE_TYPE.TASK)
  })

  test('parse a h1', () => {
    const rootNode = Parser.parseMd('# heading')
    const node = rootNode.children[0]
    expect(node.type).toBe(NODE_TYPE.HEADING)
    expect((node.data as Group).level).toBe(1)
  })

  test('parse a h6', () => {
    const rootNode = Parser.parseMd('###### heading')
    const node = rootNode.children[0]
    expect(node.type).toBe(NODE_TYPE.HEADING)
    expect((node.data as Group).level).toBe(6)
  })

  test('parse a other', () => {
    const rootNode = Parser.parseMd('some text')
    expect(rootNode.children[0].type).toBe(NODE_TYPE.OTHER)
  })

  test('parse a h2 and a task', () => {
    const text = `## heading
- [ ] text`
    const rootNode = Parser.parseMd(text)
    const h2 = rootNode.children[0]
    expect(h2.type).toBe(NODE_TYPE.HEADING)
    expect((h2.data as Group).level).toBe(2)
    const t = rootNode.children[1]
    expect(t.type).toBe(NODE_TYPE.TASK)
  })

  test('parse a h2 with a subtask', () => {
    const text = `## heading
  - [ ] text`
    const rootNode = Parser.parseMd(text)
    const h2 = rootNode.children[0]
    expect(h2.type).toBe(NODE_TYPE.HEADING)
    expect((h2.data as Group).level).toBe(2)
    const t = h2.children[0]
    expect(t.type).toBe(NODE_TYPE.TASK)
  })

  test('parse a task with a subtask', () => {
    const text = `- [ ] task
  - [ ] text`
    const rootNode = Parser.parseMd(text)
    const t = rootNode.children[0]
    expect(t.type).toBe(NODE_TYPE.TASK)
    const t1 = t.children[0]
    expect(t1.type).toBe(NODE_TYPE.TASK)
  })

  test('parse a task with a tag', () => {
    const text = `- [ ] task #dev`
    const rootNode = Parser.parseMd(text)
    const t = rootNode.children[0]
    expect(t.type).toBe(NODE_TYPE.TASK)
    const task = t.data as Task
    expect(task.tags.length).toBe(1)
    expect(task.tags[0].name).toBe("dev")
  })

  test('parse tasks with subtasks', () => {
    const text = `- [ ] t1
  - [ ] text
- [ ] t2`
    const rootNode = Parser.parseMd(text)
    const t1 = rootNode.children[0]
    expect(t1.type).toBe(NODE_TYPE.TASK)
    expect(t1.children[0].type).toBe(NODE_TYPE.TASK)
    const t2 = rootNode.children[1]
    expect(t2.type).toBe(NODE_TYPE.TASK)
  })

  test('parse tasks', () => {
    const text = `## head1
- [ ] t1
  - [ ] t1-1
  - [x] t1-2
- [ ] t2

## head2
  - [ ] t3`
    const rootNode = Parser.parseMd(text)
    const head1 = rootNode.children[0]
    expect(head1.type).toBe(NODE_TYPE.HEADING)
    const t1 = rootNode.children[1]
    expect(t1.type).toBe(NODE_TYPE.TASK)
    expect(t1.children[0].type).toBe(NODE_TYPE.TASK)
    expect(t1.children[1].type).toBe(NODE_TYPE.TASK)
    const t2 = rootNode.children[2]
    expect(t2.type).toBe(NODE_TYPE.TASK)
    const other = rootNode.children[3]
    expect(other.type).toBe(NODE_TYPE.OTHER)
    const head2 = rootNode.children[4]
    expect(head2.type).toBe(NODE_TYPE.HEADING)
    const t3 = head2.children[0]
    expect(t3.type).toBe(NODE_TYPE.TASK)
  })

  test('parse tasks 2', () => {
    const text = `# heading1
  - [ ] task
    - [ ] task2
## heading2
  - [ ] task3`
    const rootNode = Parser.parseMd(text)
    const h1 = rootNode.children[0]
    expect(h1.type).toBe(NODE_TYPE.HEADING)

    const t1 = h1.children[0]
    expect(t1.type).toBe(NODE_TYPE.TASK)
    expect(t1.children[0].type).toBe(NODE_TYPE.TASK)

    const h2 = rootNode.children[1]
    expect(h2.type).toBe(NODE_TYPE.HEADING)
    expect(h2.children[0].type).toBe(NODE_TYPE.TASK)
  })

  test('parse text in heading', () => {
    const text = `# heading1
  some text`
    const rootNode = Parser.parseMd(text)
    const h1 = rootNode.children[0]
    expect(h1.type).toBe(NODE_TYPE.HEADING)
    const other = h1.children[0]
    expect(other.type).toBe(NODE_TYPE.OTHER)
  })

  test('parse heading in heading', () => {
    const text = `# heading1
  ## heading2`
    const rootNode = Parser.parseMd(text)
    const h1 = rootNode.children[0]
    expect(h1.type).toBe(NODE_TYPE.HEADING)
    const h2 = h1.children[0]
    expect(h2.type).toBe(NODE_TYPE.HEADING)
  })

  test('parse task and heading in heading', () => {
    const text = `# heading1
  - [ ] child
  ## heading2`
    const rootNode = Parser.parseMd(text)
    const h1 = rootNode.children[0]
    expect(h1.type).toBe(NODE_TYPE.HEADING)
    const t = h1.children[0]
    expect(t.type).toBe(NODE_TYPE.TASK)
    const h2 = h1.children[1]
    expect(h2.type).toBe(NODE_TYPE.HEADING)
  })

})
