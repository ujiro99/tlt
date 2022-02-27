import { Node, nodeToString } from '@/models/node'
import { Parser } from '@/services/parser'

describe('nodeToString', () => {
  test('type Task', () => {
    const rootNode = Parser.parseMd('- [ ] task')
    const text = nodeToString(rootNode)
    expect(text).toBe('- [ ] task')
  });

  test('type Heading', () => {
    const rootNode = Parser.parseMd('# heading')
    const text = nodeToString(rootNode)
    expect(text).toBe('# heading')
  });

  test('type Text', () => {
    const rootNode = Parser.parseMd('some text')
    const text = nodeToString(rootNode)
    expect(text).toBe('some text')
  });

})


describe('toString', () => {
  test('type Task', () => {
    const rootNode = Parser.parseMd('- [ ] task')
    const node = rootNode.children[0]
    expect(node.toString()).toBe('- [ ] task')
  });

  test('type Heading', () => {
    const rootNode = Parser.parseMd('# heading')
    const node = rootNode.children[0]
    expect(node.toString()).toBe('# heading')
  });

  test('type Text', () => {
    const rootNode = Parser.parseMd('some text')
    const node = rootNode.children[0]
    expect(node.toString()).toBe('some text')
  });

})
