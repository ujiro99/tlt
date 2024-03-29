import React from 'react'

import { TaskItem, TaskCheckBox } from '@/components/TaskItem'
import { Node } from '@/models/node'
import { Task } from '@/models/task'

type Props = {
  node: Node
}

export const MdTaskItem: React.FC<Props> = (props: Props): JSX.Element => {
  const node = props.node
  const task = node.data as Task
  const checkboxProps: TaskCheckBox = {
    checked: task.isComplete(),
    disabled: false,
  }

  return (
    <TaskItem checkboxProps={checkboxProps} node={node} />
  )
}
