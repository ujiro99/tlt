import React from 'react'

import {
  Node,
  HeadingNode,
  findNode,
  NODE_TYPE,
} from '@/models/node'
import { MdHeading } from '@/components/MdHeading'
import { MdTaskItem } from '@/components/MdTaskItem'
import { MdText } from '@/components/MdText'
import { useTaskManager } from '@/hooks/useTaskManager'
import Log from '@/services/log'

type useItemAdapterReturn = [
  rootNode: Node,
  getItem: (id: string) => JSX.Element,
]

export function useItemAdapter(): useItemAdapterReturn {
  const manager = useTaskManager()
  const rootNode = manager.getNode()

  const getItem = (id: string): JSX.Element => {
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

  return [rootNode, getItem]
}
