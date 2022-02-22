import React from 'react'
import { Node, HeadingNode, NODE_TYPE } from '@/models/node'
import { MdHeading } from '@/components/MdHeading'
import { MdTaskItem } from '@/components/MdTaskItem'
import { MdText } from '@/components/MdText'

type Props = {
  nodes: Node[]
}

export const TaskContainer: React.FC<Props> = (
  props: Props,
): JSX.Element => {
  const items = props.nodes.map((node) => {
    if (node.type === NODE_TYPE.TASK) {
      return <MdTaskItem key={node.id} node={node} />
    } else if (node.type === NODE_TYPE.HEADING) {
      return <MdHeading key={node.id} node={node as HeadingNode} />
    } else {
      return <MdText key={node.id} node={node} />
    }
  })

  return <ul className="contains-task-list">{items}</ul>
}
