import React, { CSSProperties } from 'react'
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

export type BasePickerProps = {
  onRequestClose: () => void
  position?: Position
  size?: Size
  children?: React.ReactNode
}

export const BasePicker = (props: BasePickerProps): JSX.Element => {
  const size = props.size || { w: 0, h: 0 }
  const position = props.position || { x: 0, y: 0 }

  const onClickOverlay = (e: React.MouseEvent) => {
    props.onRequestClose()
    eventStop(e)
  }

  let top = Math.min(position.y + Offset.y, window.innerHeight - size.h - 10)

  if (window.innerHeight - (position.y + Offset.y + size.h) < 0) {
    top = position.y - Offset.y - size.h
  }

  const left = Math.min(position.x + Offset.x, window.innerWidth - size.w - 20)

  const style = {
    ...PickerStyle,
    top,
    left,
  } as CSSProperties

  return (
    <div
      className="BasePicker__overlay"
      onClick={onClickOverlay}
      onDragStart={eventStop}
      onPointerDown={eventStop}
    >
      <div className="BasePicker__content" style={style} onClick={eventStop}>
        {props.children}
      </div>
    </div>
  )
}
