import React from 'react'
import { selector, useRecoilValue } from 'recoil'
import { Node, HeadingNode, findNode, nodeToString, NODE_TYPE } from '@/models/node'
import { MdHeading } from '@/components/MdHeading'
import { MdTaskItem } from '@/components/MdTaskItem'
import { MdText } from '@/components/MdText'

import { TaskTextState, taskListTextState } from '@/services/state'
import { Parser } from '@/services/parser'

import Log from '@/services/log'

import type { TreeItems, FlattenedItem } from '@/components/Tree/types'

const nodeSelector = selector({
  key: 'NodeSelector',
  get: ({ get }) => {
    const text = get(taskListTextState)
    return Parser.parseMd(text)
  },
})

let initialItems: TreeItems = [
  {
    id: 'Home',
    children: [],
  },
  {
    id: 'Collections',
    children: [
      { id: 'Spring', children: [] },
      { id: 'Summer', children: [] },
      { id: 'Fall', children: [] },
      { id: 'Winter', children: [] },
    ],
  },
  {
    id: 'About Us',
    children: [],
  },
  {
    id: 'My Account',
    children: [
      { id: 'Addresses', children: [] },
      { id: 'Order History', children: [] },
    ],
  },
]

function flatten(
  items: TreeItems,
  parentId: string | null = null,
  depth = 0,
): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    return [
      ...acc,
      { ...item, parentId, depth, index },
      ...flatten(item.children, item.id, depth + 1),
    ]
  }, [])
}

type useItemAdapterReturn = [
  items: Node[] | TreeItems,
  getItem: (id: string) => JSX.Element,
  setItems: (nodes: Node[] | TreeItems) => void
]

export function useItemAdapter(): useItemAdapterReturn {
  const state = TaskTextState()
  const rootNode = useRecoilValue(nodeSelector)

  const getItem = (id: string): JSX.Element => {
    const flattenItems = flatten(initialItems)
    const item = flattenItems.find(n => n.id === id)
    if (item) return <div>{item.id}</div>

    const node = findNode(id, rootNode)
    if (!node) {
      Log.e(`${id} not found!`)
      // return null
      const empty = new Node(NODE_TYPE.OTHER, -1, '')
      return <MdText node={empty} />
    }

    if (node.type === NODE_TYPE.TASK) {
      return <MdTaskItem key={node.id} node={node} />
    } else if (node.type === NODE_TYPE.HEADING) {
      return <MdHeading key={node.id} node={node as HeadingNode} />
    } else {
      return <MdText key={node.id} node={node} />
    }
  }

  const setItems = (nodes: Node[] | TreeItems): void => {
    initialItems = nodes
    // const newText = nodeToString(nodes)
    // state.setText(newText)
  }

  // return [rootNode.children, getItem, setItems]
  return [initialItems, getItem, setItems]
}
