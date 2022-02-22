import React from 'react'

import { DraggableListItem } from '@/components/DraggableListItem'
import { TaskContainer } from '@/components/TaskContainer'
import { TaskItem, TaskCheckBox } from '@/components/TaskItem'
import { Node } from '@/models/node'
import { Task } from '@/models/task'

type Props = {
  node: Node
}

export const MdTaskItem: React.FC<Props> = (props: Props): JSX.Element => {
  const node = props.node
  const line = node.line
  const task = node.data as Task
  const hasChildren = node.children.length > 0
  const checkboxProps: TaskCheckBox = {
    checked: task.isComplete(),
    disabled: false,
  }

  return (
    <DraggableListItem
      nodeId={`${node.id}`}
      index={line}
      className={'task-list-item'}
      hasChildren={hasChildren}
    >
      <TaskItem checkboxProps={checkboxProps} line={line} />
      {hasChildren ? <TaskContainer nodes={node.children} /> : null}
    </DraggableListItem>
  )
}
