import { useState, useEffect, CSSProperties } from 'react'
import { atom, useRecoilValue, useSetRecoilState } from 'recoil'
import { DropTargetMonitor } from 'react-dnd'

import Log from '@/services/log'
import { sleep, indentToMargin } from '@/services/util'
import { DragItem } from '@/components/DraggableListItem'

export const MotionDurationMS = 200

const MOTION_TYPE = {
  SLIDE: 'SLIDE',
  FADE_IN: 'FADE_IN',
} as const
type MotionType = typeof MOTION_TYPE[keyof typeof MOTION_TYPE]

type DragMotionState = {
  line: number
  props: DragMotionProps
}

const dragMotionState = atom<DragMotionState[]>({
  key: 'dragMotionState',
  default: [],
})

type DragMotionProps = {
  motionType: MotionType
  top: number
  marginLeft?: string | number
}

const emptyProp = { top: null, motionType: null }

export function useDragMotion(
  line: number,
  hasChildren?: boolean,
  isInner?: boolean,
): CSSProperties {
  const [motionStyles, setMotionStyles] = useState<CSSProperties>({})
  const dragMotions = useRecoilValue<DragMotionState[]>(dragMotionState)
  const dragMotion = dragMotions.find((n) => n.line === line)
  const props: DragMotionProps = dragMotion?.props || emptyProp

  // Apply motion animations.
  useEffect(() => {
    if (props.top == null || props.top === 0) {
      setMotionStyles({})
      return
    }
    if (hasChildren && props.motionType === MOTION_TYPE.SLIDE) {
      setMotionStyles({})
      return
    }
    if (isInner && props.motionType === MOTION_TYPE.FADE_IN) {
      setMotionStyles({})
      return
    }

    // initial state
    const styles: CSSProperties = { top: 0 }
    if (props.motionType === MOTION_TYPE.FADE_IN) {
      styles.opacity = 0
    }
    setMotionStyles(styles)
    void sleep(1).then(() => {
      // enter animateion
      const styles: CSSProperties = { top: props.top }
      if (props.motionType === MOTION_TYPE.SLIDE) {
        styles.transition = `top ${MotionDurationMS}ms ease-out`
      } else if (props.motionType === MOTION_TYPE.FADE_IN) {
        styles.transition = `opacity ${MotionDurationMS}ms ease-out`
        styles.opacity = 1
      }
      if (props.marginLeft) {
        styles.marginLeft = props.marginLeft
      }
      setMotionStyles(styles)
    })
  }, [props.top, props.motionType, props.marginLeft, hasChildren, isInner])

  return motionStyles
}

type useMotionProps = {
  item: DragItem
  monitor: DropTargetMonitor
  dragIndex: number
  hoverIndex: number
  dropTargetRect: DOMRect
  dropAtTopOfList: boolean
  isListTop: boolean
  indent: number
}

export function useMotionExecuter(): (args: useMotionProps) => Promise<void> {
  const setDragMotions = useSetRecoilState<DragMotionState[]>(dragMotionState)

  return async ({
    item,
    monitor,
    dragIndex,
    hoverIndex,
    dropTargetRect,
    dropAtTopOfList,
    isListTop,
    indent,
  }: useMotionProps) => {
    const newMotions: DragMotionState[] = []

    //
    // Element dragged
    //
    const dragItemHeight = item.height
    const dragItemTop = monitor.getInitialSourceClientOffset()?.y
    let dropY: number
    if (dragIndex < hoverIndex) {
      // drog to down
      dropY = dropTargetRect.bottom - (dragItemTop + dragItemHeight)
      if (isListTop && dropAtTopOfList) {
        dropY = dropTargetRect.top - (dragItemTop + dragItemHeight)
      }
    } else {
      // drog to up
      dropY = dropTargetRect.bottom - dragItemTop
      if (isListTop && dropAtTopOfList) {
        dropY = dropTargetRect.top - dragItemTop
      }
    }
    newMotions.push({
      line: dragIndex,
      props: { top: dropY, motionType: MOTION_TYPE.FADE_IN },
    })
    // Calculate margin-left when dropped to subtasks.
    if (indent !== 0) {
      const marginLeft = indentToMargin(indent)
      newMotions[newMotions.length - 1].props.marginLeft = marginLeft
    }

    //
    // Elements between drag and drop
    //
    if (dragIndex < hoverIndex) {
      // drog to down
      for (let i = dragIndex + 1 + item.childrenCount; i <= hoverIndex; i++) {
        newMotions.push({
          line: i,
          props: {
            top: -dragItemHeight,
            motionType: MOTION_TYPE.SLIDE,
          },
        })
      }
    } else {
      // drog to up
      for (let i = dragIndex - 1; i > hoverIndex; i--) {
        newMotions.push({
          line: i,
          props: {
            top: dragItemHeight,
            motionType: MOTION_TYPE.SLIDE,
          },
        })
      }
    }

    // start animations in useEffect.
    Log.v('start animations')
    setDragMotions(newMotions)
    // Wait animations finished.
    await sleep(MotionDurationMS)
    // Reset styles.
    setDragMotions([])
    Log.v('finish animations')
  }
}
