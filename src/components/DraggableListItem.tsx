import React, {
  Children,
  useRef,
  useState,
  useEffect,
  cloneElement,
} from 'react'
import { useRecoilState } from 'recoil'
import classnames from 'classnames'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'
import { sleep } from '@/services/util'

import '@/components/DraggableListItem.css'

import { TaskTextState, dragMotionState } from '@/services/state'

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
  top: number
  children: React.ReactElement | React.ReactElement[]
}

export function DraggableListItem(props: Props): JSX.Element {
  const line = props.line
  const ref = useRef<HTMLLIElement>(null)
  const state = TaskTextState()
  const [dropToTop, setDropToTop] = useState(false)
  const [inMotion, setInMotion] = useState(false)
  const [motionTop, setMotionTop] = useState(0)
  const [_, setDragMotions] = useRecoilState(dragMotionState)

  // Apply motion animations.
  useEffect(() => {
    if (props.top != null && props.top !== 0) {
      setInMotion(true)
      void sleep(1).then(() => {
        setMotionTop(props.top)
      })
    } else {
      setInMotion(false)
      setMotionTop(0)
    }
  }, [props.top])

  const dropAtTopOfList = (monitor: DropTargetMonitor): boolean => {
    const hoverBoundingRect = ref.current?.getBoundingClientRect()
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
    const clientOffset = monitor.getClientOffset()
    const hoverClientY = clientOffset.y - hoverBoundingRect.top
    return hoverClientY < hoverMiddleY
  }

  const setDropMotion = (dragIndex: number, hoverIndex: number): void => {
    const dragItemRect = ref.current?.getBoundingClientRect()
    const dragItemHeight = dragItemRect.bottom - dragItemRect.top

    const newMotions = []
    if (dragIndex < hoverIndex) {
      // drog to down
      for (let i = dragIndex + 1; i <= hoverIndex; i++) {
        newMotions.push({ line: i, top: -dragItemHeight })
      }
    } else {
      // drog to up
      for (let i = dragIndex - 1; i > hoverIndex; i--) {
        newMotions.push({ line: i, top: dragItemHeight })
      }
    }
    console.log(newMotions)
    setDragMotions(newMotions)
  }

  const execDrop = async (
    item: DragItem,
    dragIndex: number,
    hoverIndex: number,
  ) => {
    setDropMotion(dragIndex, hoverIndex)
    await sleep(1000)
    state.moveLines(dragIndex, hoverIndex)
    item.index = hoverIndex
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

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      if (props.isListTop) {
        if (dropAtTopOfList(monitor)) {
          hoverIndex--
        }
      }

      void execDrop(item, dragIndex, hoverIndex)
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
      style={{
        top: motionTop,
        transition: inMotion ? 'top 1s ease-out' : null,
      }}
    >
      {newChildren}
    </li>
  )
}
