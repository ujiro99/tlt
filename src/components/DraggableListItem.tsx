import React from 'react'
import {
  useSortable,
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import classnames from 'classnames'

// import Log from '@/services/log'
import '@/components/DraggableListItem.css'

type Props = {
  nodeId: string
  index: number
  className: string
  hasChildren: boolean
  children: React.ReactElement | React.ReactElement[]
  isHeading?: boolean
}

const DRAGGABLE_ITEM_CLASS = 'draggable-item'

export function DraggableListItem(props: Props): JSX.Element {
  const index = `${props.index}`

  const animateLayoutChanges: AnimateLayoutChanges = (args) =>
    args.isSorting || args.wasDragging
      ? defaultAnimateLayoutChanges(args)
      : true

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: index, animateLayoutChanges })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const className = classnames(props.className, DRAGGABLE_ITEM_CLASS)

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={className}
    >
      {props.children}
    </li>
  )
}
