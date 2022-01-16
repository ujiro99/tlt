import React, { Children, cloneElement } from 'react'
import type { DragSource, DragPreview } from 'dnd'

type Props = {
  children: React.ReactElement | React.ReactElement[]
}

export const TaskItemContiner: React.FC<Props> = (
  props: Props & DragSource & DragPreview
): JSX.Element => {
  const newChildren = Children.map(props.children, (child) => {
    return cloneElement(child, { drag: props.drag })
  })

  return <div ref={props.preview}>{newChildren}</div>
}
