import React, { ReactElement } from 'react'

import { DraggableListItem } from '@/components/DraggableListItem'
import { TaskItem, TaskCheckBox } from '@/components/TaskItem'
import { TaskTextState } from '@/services/state'
import { useDragMotion } from '@/hooks/useDragMotion'
import { TransProps } from 'popup'

export const MdListItem: React.FC<unknown> = (
  props: TransProps,
): JSX.Element => {
  const line = props.node.position.start.line
  const inList = props.node.position.start.column > 1
  const motionStyles = useDragMotion(line, false, true)

  if (props.className !== 'task-list-item') {
    return <li className={props.className}>{props.children}</li>
  }

  let checkboxProps: TaskCheckBox
  let subItem: ReactElement
  let subItemCount = 0
  let p: JSX.ElementChildrenAttribute
  for (const child of props.children) {
    switch (child.type) {
      case 'input':
        checkboxProps = child.props as unknown as TaskCheckBox
        break
      case 'ul':
        subItem = child
        p = child.props as JSX.ElementChildrenAttribute
        subItemCount = (p.children as ReactElement<TransProps>[]).filter(
          (n) => n.props?.className === 'task-list-item',
        ).length
        break
      case 'p':
        p = child.props as JSX.ElementChildrenAttribute
        checkboxProps = (p.children as ReactElement[])[0]
          .props as unknown as TaskCheckBox
        break
      default:
        break
    }
  }

  // Checks whether it is at the top of the list
  const state = TaskTextState()
  const isListTop = !state.isTaskStrByLine(line - 1)

  return (
    <DraggableListItem
      className={props.className}
      line={line}
      isListTop={isListTop}
      inList={inList}
      hasChildren={subItem != null}
      childrenCount={subItemCount}
    >
      {subItem ? (
        <>
          <TaskItem
            checkboxProps={checkboxProps}
            line={line}
            style={motionStyles}
          />
          {subItem}
        </>
      ) : (
        <TaskItem checkboxProps={checkboxProps} line={line} />
      )}
    </DraggableListItem>
  )
}
