import React, { CSSProperties, useEffect } from 'react'
import { useHover, useHoverCancel } from '@/hooks/useHover'
import { eventStop } from '@/services/util'

import './BasePicker.css'

type Size = {
  w: number
  h: number
}

export type Position = {
  x: number
  y: number
}

export const EVENT_TYPE = {
  CLICK: 'CLICK',
  HOVER: 'HOVER',
} as const
export type EventType = typeof EVENT_TYPE[keyof typeof EVENT_TYPE]

const TopAdjust = {
  [EVENT_TYPE.CLICK]: 20,
  [EVENT_TYPE.HOVER]: 5,
}

const LeftAdjust = {
  [EVENT_TYPE.CLICK]: -10,
  [EVENT_TYPE.HOVER]: -10,
}

const PaddingAdjust = {
  [EVENT_TYPE.CLICK]: 0,
  [EVENT_TYPE.HOVER]: 5,
}

export type BasePickerProps = {
  onRequestClose: () => void
  position?: Position
  size?: Size
  eventType?: EventType
  children?: React.ReactNode
}

export const BasePicker = (props: BasePickerProps): JSX.Element => {
  const position = props.position || { x: 0, y: 0 }
  const eventType = props.eventType || EVENT_TYPE.CLICK
  const [hoverRef, isHovered] = useHover()
  const [startRef] = useHoverCancel()
  const [contentRef] = useHoverCancel()

  let size = props.size || { w: 0, h: 0 }
  const node = contentRef.current
  if (node) {
    // overwrite with actual size
    size = { w: node.offsetWidth, h: node.offsetHeight }
  }

  const onClickOverlay = (e: React.MouseEvent) => {
    if (eventType === EVENT_TYPE.CLICK) {
      props.onRequestClose()
      eventStop(e)
    }
  }

  const onClickPadding = (e: React.MouseEvent) => {
    props.onRequestClose()
    eventStop(e)
  }

  useEffect(() => {
    if (isHovered && eventType === EVENT_TYPE.HOVER) {
      props.onRequestClose()
    }
  }, [isHovered])

  let paddingTop = PaddingAdjust[eventType]
  let paddingBottom = 0
  let top = position.y + TopAdjust[eventType]
  if (window.innerHeight < position.y + size.h + TopAdjust[eventType]) {
    top = position.y - size.h - TopAdjust[eventType]
    paddingTop = 0
    paddingBottom = PaddingAdjust[eventType]
  }

  const left = Math.min(
    position.x + LeftAdjust[eventType],
    window.innerWidth - size.w - 20,
  )

  const style = {
    top,
    left,
    paddingTop,
    paddingBottom,
  } as CSSProperties

  return (
    <div
      className="BasePicker__overlay"
      onClick={onClickOverlay}
      onDragStart={eventStop}
      onPointerDown={eventStop}
      ref={hoverRef as React.RefObject<HTMLDivElement>}
    >
      <div
        className="BasePicker__start-position"
        style={{top: position.y - 10, left: position.x - 10}}
        onClick={onClickPadding}
        ref={startRef as React.RefObject<HTMLDivElement>}
        />
      <div
        className="BasePicker__content"
        style={style}
        onClick={onClickPadding}
        ref={contentRef as React.RefObject<HTMLDivElement>}
      >
        <div onClick={eventStop}>{props.children}</div>
      </div>
    </div>
  )
}
