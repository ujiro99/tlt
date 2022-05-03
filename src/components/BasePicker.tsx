import React, { CSSProperties, useEffect } from 'react'
import { useHover, useHoverCancel } from '@/hooks/useHover'
import { eventStop } from '@/services/util'

import './BasePicker.css'

const Offset = {
  x: 0,
  y: 30,
}

const PickerStyle = {
  position: 'absolute',
} as CSSProperties

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

export type BasePickerProps = {
  onRequestClose: () => void
  position?: Position
  size?: Size
  eventType?: EventType
  children?: React.ReactNode
}

export const BasePicker = (props: BasePickerProps): JSX.Element => {
  const size = props.size || { w: 0, h: 0 }
  const position = props.position || { x: 0, y: 0 }
  const eventType = props.eventType || EVENT_TYPE.CLICK
  const [hoverRef, isHovered] = useHover()
  const [hoverCancelRef] = useHoverCancel()

  const onClickOverlay = (e: React.MouseEvent) => {
    if (eventType === EVENT_TYPE.CLICK) {
      props.onRequestClose()
      eventStop(e)
    }
  }

  useEffect(() => {
    if (isHovered && eventType === EVENT_TYPE.HOVER) {
      props.onRequestClose()
    }
  }, [isHovered])

  let top = Math.min(position.y, window.innerHeight - size.h - 10)

  if (window.innerHeight - (position.y + size.h) < 0) {
    top = position.y - size.h
  }

  const left = Math.min(position.x + Offset.x, window.innerWidth - size.w - 20)

  const style = {
    ...PickerStyle,
    top,
    left,
    paddingTop: `${Offset.y}px`,
  } as CSSProperties

  return (
    <div
      className="BasePicker__overlay"
      onClick={onClickOverlay}
      onDragStart={eventStop}
      onPointerDown={eventStop}
      ref={hoverRef as React.Ref<HTMLDivElement>}
    >
      <div
        className="BasePicker__content"
        style={style}
        onClick={eventStop}
        ref={hoverCancelRef as React.Ref<HTMLDivElement>}
      >
        {props.children}
      </div>
    </div>
  )
}
