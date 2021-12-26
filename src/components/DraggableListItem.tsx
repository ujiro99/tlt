import React, { Children, useRef, cloneElement } from 'react'
import classnames from 'classnames'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'

import Log from '@/services/log'

import { TaskTextState } from '@/services/state'

const DnDItems = {
  Task: 'Task',
} as const

interface DragItem {
  index: number
  id: string
  type: string
}

type Props = {
  line: number
  className: string
  children: React.ReactElement | React.ReactElement[]
}

export function DraggableListItem(props: Props): JSX.Element {
  const line = props.line
  const ref = useRef<HTMLLIElement>(null)
  const state = TaskTextState()

  const [{ handlerId, isOver }, drop] = useDrop({
    accept: DnDItems.Task,
    collect(monitor) {
      return { handlerId: monitor.getHandlerId(), isOver: monitor.isOver() }
    },
    drop(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = line

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      /*
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      */

      // Time to actually perform the action
      Log.d(`${dragIndex} -> ${hoverIndex} : ${item.id}`)
      state.moveLines(dragIndex, hoverIndex)

      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag, preview] = useDrag({
    type: DnDItems.Task,
    item: () => ({ index: line }),
    collect: (monitor) => {
      return {
        isDragging: monitor.isDragging(),
      }
    },
  })

  drag(drop(ref))

  const className = classnames(props.className, {
    'task-list-item--hover': isOver,
    'task-list-item--drag': isDragging,
  })

  const newChildren = Children.map(props.children, (child) => {
    return cloneElement(child, { preview: preview })
  })

  return (
    <li
      className={className}
      ref={ref}
      data-handler-id={handlerId}
    >
      {newChildren}
    </li>
  )
}
