import React, { Children, useRef, useState, cloneElement } from 'react'
import classnames from 'classnames'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'

import { useDragMotion, useMotionExecuter } from '@/hooks/useDragMotion'
import { Task } from '@/models/task'
import { TaskTextState } from '@/services/state'
import Log from '@/services/log'
import '@/components/DraggableListItem.css'

const DnDItems = {
  Task: 'Task',
} as const

export interface DragItem {
  index: number
  type: string
  top: number
  height: number
  hasChildren: boolean
  childrenCount: number
}

type Props = {
  line: number
  className: string
  hasChildren: boolean
  children: React.ReactElement | React.ReactElement[]
  isHeading?: boolean
}

const DRAGGABLE_ITEM_CLASS = 'draggable-item'
const INNER_ITEM_CLASS = 'task-item'

function countChildren(rootElemnt: Element) {
  const queue: Element[] = [rootElemnt]
  let count = 0

  // breadth first search
  try {
    while (queue.length > 0) {
      const elm = queue.shift()
      if (
        !elm.className.indexOf ||
        elm.className.indexOf(INNER_ITEM_CLASS) >= 0
      ) {
        // Do not scan to the inside of task-item.
        continue
      }
      if (elm.children.length > 0) {
        const children = Array.from(elm.children)
        queue.push(...children)
        count += children.filter(
          (child) =>
            child.className.indexOf &&
            child.className.indexOf(DRAGGABLE_ITEM_CLASS) >= 0,
        ).length
      }
    }
  } catch (e) {
    Log.w(e)
  }

  return count
}

export function DraggableListItem(props: Props): JSX.Element {
  const line = props.line
  const ref = useRef<HTMLLIElement>(null)
  const state = TaskTextState()
  const [dropUpperHalf, setDropUpperHalf] = useState(false)
  const motionStyles = useDragMotion(line, props.hasChildren)
  const execDragMotions = useMotionExecuter()

  const isDropPositionUpperHalf = (monitor: DropTargetMonitor): boolean => {
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
    dragIndex: number,
    hoverIndex: number,
    upperHalf: boolean,
  ) => {
    // When dropping on an element with subtasks, calculate motions
    // based on the size of the element without subtasks.
    let dropTargetRect = ref.current.getBoundingClientRect()
    if (props.hasChildren) {
      dropTargetRect =
        ref.current.children[0].children[0].getBoundingClientRect()
    }

    if (upperHalf) {
      hoverIndex--
    }

    let dropTargetIndex = hoverIndex
    if (props.hasChildren) {
      dropTargetIndex++
    }

    const dragTask = Task.parse(state.getTextByLine(dragIndex))
    const isTask = !!dragTask
    const dragIndent = isTask ? dragTask.indent : 0
    const task = Task.parse(state.getTextByLine(dropTargetIndex))
    const indent = task ? task.indent : 0

    // Start animations.
    await execDragMotions({
      item,
      dragIndex,
      hoverIndex,
      dropTargetRect,
      upperHalf: upperHalf,
      indent: indent - dragIndent,
    })

    // Perform a row move
    state.moveLines(
      dragIndex,
      hoverIndex,
      item.childrenCount + 1,
      isTask ? indent : null,
    )
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
      const hoverIndex = line
      const upperHalf = isDropPositionUpperHalf(monitor)

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }
      // Don't replace items with previous element's bottom half.
      if (dragIndex - 1 === hoverIndex && !upperHalf) {
        return
      }
      // Don't replace items with next element's top half.
      if (dragIndex + 1 === hoverIndex && upperHalf) {
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

      void execDrop(item, dragIndex, hoverIndex, upperHalf)
    },
    hover(_, monitor: DropTargetMonitor) {
      setDropUpperHalf(false)

      if (!ref.current) {
        return
      }

      if (isDropPositionUpperHalf(monitor)) {
        setDropUpperHalf(true)
      }
    },
  })

  const [{ isDragging }, drag, preview] = useDrag({
    type: DnDItems.Task,
    item: () => ({
      index: line,
      height: ref.current.offsetHeight,
      top: ref.current.getBoundingClientRect().top,
      hasChildren: props.hasChildren,
      childrenCount: countChildren(ref.current),
    }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  })

  drop(ref)

  const className = classnames(props.className, DRAGGABLE_ITEM_CLASS, {
    [`${DRAGGABLE_ITEM_CLASS}--drag`]: isDragging,
    [`${DRAGGABLE_ITEM_CLASS}--drop-hover`]: isOver,
    [`${DRAGGABLE_ITEM_CLASS}--drop-top`]: dropUpperHalf,
    [`${DRAGGABLE_ITEM_CLASS}--parent`]: props.hasChildren,
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
