import React, { Children, useRef, useState, cloneElement } from 'react'
import { useSetRecoilState } from 'recoil'
import classnames from 'classnames'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'
import { sleep } from '@/services/util'
import {
  MotionDurationMS,
  useDragMotion,
  useMotionCalculator,
} from '@/hooks/useDragMotion'

import { Task } from '@/models/task'

import '@/components/DraggableListItem.css'

import {
  TaskTextState,
  dragMotionState,
  DragMotionState,
  MotionType,
} from '@/services/state'

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
  top: number
  motionType: MotionType
  hasChildren: boolean
  childrenCount: number
  children: React.ReactElement | React.ReactElement[]
}

export function DraggableListItem(props: Props): JSX.Element {
  const line = props.line
  const ref = useRef<HTMLLIElement>(null)
  const state = TaskTextState()
  const [dropToTop, setDropToTop] = useState(false)
  const setDragMotions = useSetRecoilState<DragMotionState[]>(dragMotionState)

  const motionStyles = useDragMotion({
    top: props.top,
    motionType: props.motionType,
  })
  const calcDragMotions = useMotionCalculator()

  const dropAtTopOfList = (monitor: DropTargetMonitor): boolean => {
    const dropTargetRect = ref.current?.getBoundingClientRect()
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
    const newMotions = calcDragMotions({
      item,
      monitor,
      dragIndex,
      hoverIndex,
      dropTargetRect: ref.current?.getBoundingClientRect(),
      isListTop: props.isListTop,
      dropAtTopOfList: dropAtTopOfList(monitor),
    })
    setDragMotions(newMotions)

    await sleep(MotionDurationMS)
    const task = Task.parse(state.getTextByLine(hoverIndex + 1))
    state.moveLines(dragIndex, hoverIndex, item.childrenCount + 1, task.indent)
    item.index = hoverIndex
    // finish animations.
    setDragMotions([])
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
