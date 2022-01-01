import React, {
  Children,
  useRef,
  useState,
  useEffect,
  cloneElement,
} from 'react'
import { useSetRecoilState } from 'recoil'
import classnames from 'classnames'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'
import { sleep } from '@/services/util'

import '@/components/DraggableListItem.css'

import {
  TaskTextState,
  dragMotionState,
  DragMotionState,
  MOTION_TYPE,
  MotionType,
} from '@/services/state'

const DnDItems = {
  Task: 'Task',
} as const

interface MotionStyle {
  transition?: string
  opacity?: number
  top?: number
}

interface DragItem {
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

const MotionDurationMS = 200

export function DraggableListItem(props: Props): JSX.Element {
  const line = props.line
  const ref = useRef<HTMLLIElement>(null)
  const state = TaskTextState()
  const [dropToTop, setDropToTop] = useState(false)
  const [motionStyles, setMotionStyles] = useState<MotionStyle>({})
  const setDragMotions = useSetRecoilState<DragMotionState[]>(dragMotionState)

  const dropAtTopOfList = (monitor: DropTargetMonitor): boolean => {
    const dropTargetRect = ref.current?.getBoundingClientRect()
    const dropMiddleY = (dropTargetRect.bottom - dropTargetRect.top) / 2
    const clientOffset = monitor.getClientOffset()
    if (clientOffset == null) return false
    const hoverClientY = clientOffset.y - dropTargetRect.top
    return hoverClientY < dropMiddleY
  }

  // Apply motion animations.
  useEffect(() => {
    if (props.top != null && props.top !== 0) {
      // initial state
      const styles: MotionStyle = { top: 0 }
      if (props.motionType === MOTION_TYPE.FADE_IN) {
        styles.opacity = 0
      }
      setMotionStyles(styles)
      void sleep(1).then(() => {
        // enter animateion
        const styles: MotionStyle = {}
        styles.top = props.top
        if (props.motionType === MOTION_TYPE.SLIDE) {
          styles.transition = `top ${MotionDurationMS}ms ease-out`
        } else if (props.motionType === MOTION_TYPE.FADE_IN) {
          styles.transition = `opacity ${MotionDurationMS}ms ease-out`
          styles.opacity = 1
        }
        setMotionStyles(styles)
      })
    } else {
      setMotionStyles({})
    }
  }, [props.top, props.motionType])

  const calcDragMotions = (
    item: DragItem,
    monitor: DropTargetMonitor,
    dragIndex: number,
    hoverIndex: number,
  ): void => {
    const newMotions: DragMotionState[] = []

    // Element dragged
    const dragItemHeight = item.height
    const dropTargetRect = ref.current?.getBoundingClientRect()
    const dragItemTop = monitor.getInitialSourceClientOffset()?.y
    let dropY: number
    if (dragIndex < hoverIndex) {
      // drog to down
      dropY = dropTargetRect.bottom - (dragItemTop + dragItemHeight)
    } else {
      // drog to up
      dropY = dropTargetRect.bottom - dragItemTop
      if (props.isListTop && dropAtTopOfList(monitor)) {
        dropY = dropTargetRect.top - dragItemTop
      }
    }
    newMotions.push({ line: dragIndex, top: dropY, type: MOTION_TYPE.FADE_IN })

    // Elements between drag and drop
    if (dragIndex < hoverIndex) {
      // drog to down
      for (let i = dragIndex + 1 + item.childrenCount; i <= hoverIndex; i++) {
        newMotions.push({
          line: i,
          top: -dragItemHeight,
          type: MOTION_TYPE.SLIDE,
        })
      }
    } else {
      // drog to up
      for (let i = dragIndex - 1; i > hoverIndex; i--) {
        newMotions.push({
          line: i,
          top: dragItemHeight,
          type: MOTION_TYPE.SLIDE,
        })
      }
    }

    setDragMotions(newMotions)
  }

  const execDrop = async (
    item: DragItem,
    monitor: DropTargetMonitor,
    dragIndex: number,
    hoverIndex: number,
  ) => {
    calcDragMotions(item, monitor, dragIndex, hoverIndex)
    await sleep(MotionDurationMS)
    state.moveLines(dragIndex, hoverIndex, item.childrenCount + 1)
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
