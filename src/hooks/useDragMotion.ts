import { useState, useEffect, CSSProperties } from 'react'
import { DropTargetMonitor } from 'react-dnd'
import { sleep } from '@/services/util'

import { DragMotionState, MOTION_TYPE, MotionType } from '@/services/state'

import { DragItem } from '@/components/DraggableListItem'

export const MotionDurationMS = 200

type useDragMotionProps = {
  top: number
  motionType: MotionType
}

export function useDragMotion(props: useDragMotionProps): CSSProperties {
  const [motionStyles, setMotionStyles] = useState<CSSProperties>({})

  // Apply motion animations.
  useEffect(() => {
    if (props.top != null && props.top !== 0) {
      // initial state
      const styles: CSSProperties = { top: 0 }
      if (props.motionType === MOTION_TYPE.FADE_IN) {
        styles.opacity = 0
      }
      setMotionStyles(styles)
      void sleep(1).then(() => {
        // enter animateion
        const styles: CSSProperties = {}
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

  return motionStyles
}

type useMotionCalcProps = {
  item: DragItem
  monitor: DropTargetMonitor
  dragIndex: number
  hoverIndex: number
  dropTargetRect: DOMRect
  dropAtTopOfList: boolean
  isListTop: boolean
}

export function useMotionCalculator(): (
  args: useMotionCalcProps,
) => DragMotionState[] {
  return ({
    item,
    monitor,
    dragIndex,
    hoverIndex,
    dropTargetRect,
    dropAtTopOfList,
    isListTop,
  }: useMotionCalcProps) => {
    const newMotions: DragMotionState[] = []

    // Element dragged
    const dragItemHeight = item.height
    const dragItemTop = monitor.getInitialSourceClientOffset()?.y
    let dropY: number
    if (dragIndex < hoverIndex) {
      // drog to down
      dropY = dropTargetRect.bottom - (dragItemTop + dragItemHeight)
    } else {
      // drog to up
      dropY = dropTargetRect.bottom - dragItemTop
      if (isListTop && dropAtTopOfList) {
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

    return newMotions
  }
}
