import React from 'react'

import { DraggableListItem } from '@/components/DraggableListItem'
import { TaskContainer } from '@/components/TaskContainer'
import { TaskItem, TaskCheckBox } from '@/components/TaskItem'
import { DragItemContainer } from '@/components/DragItemContainer'
import { useDragMotion } from '@/hooks/useDragMotion'
import { Node } from '@/models/node'
import { Task } from '@/models/task'

type Props = {
  node: Node,
}

export const MdListItem: React.FC<Props> = (
  props: Props,
): JSX.Element => {
  const node = props.node
  const line = node.line
  const motionStyles = useDragMotion(line, false, true)
  const task = node.data as Task
  const hasChildren = node.children.length > 0
  const checkboxProps: TaskCheckBox = {
    checked: task.isComplete(),
    disabled: false
  }

  return (
    <DraggableListItem
      className={'task-list-item'}
      line={line}
      hasChildren={hasChildren}
    >
      {hasChildren ? (
        <DragItemContainer>
          <TaskItem
            checkboxProps={checkboxProps}
            line={line}
            style={motionStyles}
          />
          <TaskContainer nodes={node.children} />
        </DragItemContainer>
      ) : (
        <TaskItem checkboxProps={checkboxProps} line={line} />
      )}
    </DraggableListItem>
  )
}
