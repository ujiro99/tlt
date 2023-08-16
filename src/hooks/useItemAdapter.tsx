import React from 'react'
import type { UniqueIdentifier } from '@dnd-kit/core'

import { Node, NODE_TYPE } from '@/models/node'
import { MdHeading } from '@/components/MdHeading'
import { MdTaskItem } from '@/components/MdTaskItem'
import { MdText } from '@/components/MdText'
import { MdWrapper } from '@/components/MdWrapper'
import { useTaskManager } from '@/hooks/useTaskManager'
import Log from '@/services/log'

type getItemReturn = { elm: JSX.Element; isCollapsable: boolean }
type useItemAdapterReturn = [getItem: (id: UniqueIdentifier) => getItemReturn]

export function useItemAdapter(): useItemAdapterReturn {
  const manager = useTaskManager()
  const rootNode = manager.getRoot()

  const getItem = (id: UniqueIdentifier): getItemReturn => {
    const node = rootNode.find((n) => n.id === id)
    if (!node) {
      Log.w(`${id} not found!`)
      // return null
      const empty = new Node(NODE_TYPE.OTHER, -1, '')
      return { elm: <MdText node={empty} />, isCollapsable: false }
    }

    let elm: JSX.Element
    let isCollapsable = false
    if (node.type === NODE_TYPE.TASK) {
      elm = <MdTaskItem key={node.id} node={node} />
    } else if (node.type === NODE_TYPE.HEADING) {
      elm = <MdHeading key={node.id} node={node} />
      isCollapsable = true
    } else {
      elm = <MdText key={node.id} node={node} />
    }
    return { elm: <MdWrapper line={node.line}>{elm}</MdWrapper>, isCollapsable }
  }

  return [getItem]
}
