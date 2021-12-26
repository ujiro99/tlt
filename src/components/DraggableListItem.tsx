import React, { Children, useRef, useState, cloneElement } from 'react'
import classnames from 'classnames'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'

import '@/components/DraggableListItem.css'

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
  isListTop: boolean
  children: React.ReactElement | React.ReactElement[]
}

export function DraggableListItem(props: Props): JSX.Element {
  const line = props.line
  const ref = useRef<HTMLLIElement>(null)
  const state = TaskTextState()
  const [dropToTop, setDropToTop] = useState(false)

  const dropAtTopOfList = (
    monitor: DropTargetMonitor,
  ) => {
    const hoverBoundingRect = ref.current?.getBoundingClientRect()
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
    const clientOffset = monitor.getClientOffset()
    const hoverClientY = clientOffset.y - hoverBoundingRect.top
    return hoverClientY < hoverMiddleY
  }

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
      let hoverIndex = line

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      if (props.isListTop) {
        if (dropAtTopOfList(monitor)) {
          hoverIndex--
        }
      }

      state.moveLines(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
    hover(_, monitor: DropTargetMonitor) {
      setDropToTop(false)

      if (!ref.current) {
        return
      }

      if (props.isListTop && dropAtTopOfList(monitor)) {
        setDropToTop(true)
      }
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
    'task-list-item--list-top': props.isListTop,
    'task-list-item--drop-top': dropToTop,
  })

  const newChildren = Children.map(props.children, (child) => {
    return cloneElement(child, { preview: preview })
  })

  return (
    <li className={className} ref={ref} data-handler-id={handlerId}>
      {newChildren}
    </li>
  )
}
