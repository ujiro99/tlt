import React from 'react'
import type { UniqueIdentifier } from '@dnd-kit/core'

import { Node, NODE_TYPE } from '@/models/node'
import { MdHeading } from '@/components/MdHeading'
import { MdTaskItem } from '@/components/MdTaskItem'
import { MdText } from '@/components/MdText'
import { useTaskManager } from '@/hooks/useTaskManager'
import Log from '@/services/log'

type useItemAdapterReturn = [getItem: (id: UniqueIdentifier) => JSX.Element]

export function useItemAdapter(): useItemAdapterReturn {
  const manager = useTaskManager()
  const rootNode = manager.getRoot()

  const getItem = (id: UniqueIdentifier): JSX.Element => {
    const node = rootNode.find((n) => n.id === id)
    if (!node) {
      Log.w(`${id} not found!`)
      // return null
      const empty = new Node(NODE_TYPE.OTHER, -1, '')
      return <MdText node={empty} />
    }

    if (node.type === NODE_TYPE.TASK) {
      return <MdTaskItem key={node.id} node={node} />
    } else if (node.type === NODE_TYPE.HEADING) {
      return <MdHeading key={node.id} node={node} />
    } else {
      return <MdText key={node.id} node={node} />
    }
  }

  return [getItem]
}
