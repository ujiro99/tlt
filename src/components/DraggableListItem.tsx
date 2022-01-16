import React, { Children, useRef, useState, cloneElement } from 'react'
import classnames from 'classnames'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'

import { useDragMotion, useMotionExecuter } from '@/hooks/useDragMotion'
import { Task } from '@/models/task'
import { TaskTextState } from '@/services/state'

import '@/components/DraggableListItem.css'

const DnDItems = {
  Task: 'Task',
} as const

export interface DragItem {
  index: number
  type: string
  height: number
  hasChildren: boolean
  childrenCount: number
}

type Props = {
  line: number
  className: string
  isListTop: boolean
  inList: boolean
  hasChildren: boolean
  childrenCount: number
  children: React.ReactElement | React.ReactElement[]
}

export function DraggableListItem(props: Props): JSX.Element {
  const line = props.line
  const ref = useRef<HTMLLIElement>(null)
  const state = TaskTextState()
  const [dropToTop, setDropToTop] = useState(false)
  const motionStyles = useDragMotion(line, props.hasChildren)
  const execDragMotions = useMotionExecuter()

  const dropAtTopOfList = (monitor: DropTargetMonitor): boolean => {
    let dropTargetRect = ref.current?.getBoundingClientRect()
    if (props.hasChildren) {
      dropTargetRect = ref.current.children[0].getBoundingClientRect()
    }
    const dropMiddleY = (dropTargetRect.bottom - dropTargetRect.top) / 2
    const clientOffset = monitor.getClientOffset()
    if (clientOffset == null) return false
    const hoverClientY = clientOffset.y - dropTargetRect.top
    return hoverClientY < dropMiddleY
  }

  const execDrop = async (
    item: DragItem,
    monitor: DropTargetMonitor,
    dragIndex: number,
    hoverIndex: number,
  ) => {
    // When dropping on an element with subtasks, calculate motions
    // based on the size of the element without subtasks.
    let dropTargetRect = ref.current.getBoundingClientRect()
    if (props.hasChildren) {
      dropTargetRect = ref.current.children[0].getBoundingClientRect()
    }

    let dropTargetIndex = hoverIndex
    if (props.hasChildren) {
      dropTargetIndex++
    } else if (props.isListTop && dropAtTopOfList(monitor)) {
      dropTargetIndex++
    }

    const dragTask = Task.parse(state.getTextByLine(dragIndex))
    const dragIndent = dragTask.indent
    const task = Task.parse(state.getTextByLine(dropTargetIndex))
    const indent = task.indent

    // Start animations.
    await execDragMotions({
      item,
      monitor,
      dragIndex,
      hoverIndex,
      dropTargetRect,
      isListTop: props.isListTop,
      dropAtTopOfList: dropAtTopOfList(monitor),
      indent: indent - dragIndent,
    })

    // Perform a row move
    state.moveLines(dragIndex, hoverIndex, item.childrenCount + 1, indent)
    item.index = hoverIndex
  }

  const [{ handlerId, isOver }, drop] = useDrop({
    accept: DnDItems.Task,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver({ shallow: true }),
      }
    },
    drop(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return
      }
      if (!monitor.canDrop()) {
        return
      }
      const dragIndex = item.index
      let hoverIndex = line

      if (props.isListTop && dropAtTopOfList(monitor)) {
        hoverIndex--
      }

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }
      // Don't replace items with previous element
      if (dragIndex - 1 === hoverIndex) {
        return
      }
      // Don't drop in subtasks.
      if (
        item.hasChildren &&
        dragIndex < hoverIndex &&
        dragIndex + item.childrenCount >= hoverIndex
      ) {
        return
      }

      void execDrop(item, monitor, dragIndex, hoverIndex)
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
    item: () => ({
      index: line,
      height: ref.current.offsetHeight,
      hasChildren: props.hasChildren,
      childrenCount: props.childrenCount,
    }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  })

  drop(ref)

  const className = classnames(props.className, {
    'task-list-item--drag': isDragging,
    'task-list-item--drop-hover': isOver,
    'task-list-item--list-top': props.isListTop,
    'task-list-item--drop-top': dropToTop,
    'task-list-item--parent': props.hasChildren,
  })

  const newChildren = Children.map(props.children, (child) => {
    return cloneElement(child, { drag: drag, preview: preview })
  })

  return (
    <li
      className={className}
      ref={ref}
      data-handler-id={handlerId}
      style={motionStyles}
    >
      {newChildren}
    </li>
  )
}
