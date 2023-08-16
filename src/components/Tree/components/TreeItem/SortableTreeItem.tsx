import React, { CSSProperties } from 'react'
import type { UniqueIdentifier } from '@dnd-kit/core'
import { AnimateLayoutChanges, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { TreeItem, Props as TreeItemProps } from './TreeItem'
import { iOS } from '../../utilities'

import { useItemAdapter } from '@/hooks/useItemAdapter'

interface Props extends TreeItemProps {
  id: UniqueIdentifier
}

const animateLayoutChanges: AnimateLayoutChanges = ({
  isSorting,
  wasDragging,
}) => (isSorting || wasDragging ? false : true)

export function SortableTreeItem({ id, depth, ...props }: Props) {
  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
  })
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  const [getItem] = useItemAdapter()
  const { elm, isCollapsable } = getItem(id)

  return (
    <TreeItem
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
      style={style}
      depth={depth}
      ghost={isDragging}
      disableSelection={iOS}
      disableInteraction={isSorting}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      {...props}
      // override onCollapse
      onCollapse={isCollapsable ? props.onCollapse : undefined}
    >
      {elm}
    </TreeItem>
  )
}
