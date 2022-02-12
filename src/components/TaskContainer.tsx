import React from 'react'
import { Node, HeadingNode, NODE_TYPE } from '@/models/node'
import { MdHeading } from '@/components/MdHeading'
import { MdListItem } from '@/components/MdListItem'

type Props = {
  nodes: Node[]
}

export const TaskContainer: React.FC<Props> = (
  props: Props,
): JSX.Element => {
  const items = props.nodes.map((node) => {
    if (node.type === NODE_TYPE.TASK) {
      return <MdListItem key={node.key} node={node} />
    } else if (node.type === NODE_TYPE.HEADING) {
      return <MdHeading key={node.key} node={node as HeadingNode} />
    } else {
      return <li key={node.key}>{node.data}</li>
    }
  })

  return <ul className="contains-task-list">{items}</ul>
}
