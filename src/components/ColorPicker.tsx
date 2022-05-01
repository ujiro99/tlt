import React, { CSSProperties } from 'react'
import { SketchPicker, ColorResult } from 'react-color'

import './ColorPicker.css'

const PickerSize = {
  w: 220,
  h: 300,
}

const Offset = {
  x: 0,
  y: 20,
}

const PickerStyle = {
  position: 'absolute',
} as CSSProperties

const PresetColors = [
  '#eb144c',
  '#f78da7',
  '#f47373',
  '#ff8a65',
  '#dce775',
  '#37d67a',
  '#009688',
  '#2ccce4',
  '#0693e3',
  '#3f51b5',
  '#ba68c8',
  '#f9fafb',
  '#d9e3f0',
  '#697689',
  '#555555',
]

export type Position = {
  x: number
  y: number
}

type Props = {
  onClick: (e: React.MouseEvent) => void
  onChange: (color: ColorResult) => void
  onChangeComplete: (color: ColorResult) => void
  color: string
  position: Position
}

export const ColorPicker = (props: Props): JSX.Element => {
  const eventCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleOnClick = (e: React.MouseEvent) => {
    props.onClick(e)
    eventCancel(e)
  }

  let top = Math.min(
    props.position.y + Offset.y,
    window.innerHeight - PickerSize.h - 10,
  )

  if (window.innerHeight - (props.position.y + Offset.y + PickerSize.h) < 0) {
    top = props.position.y - Offset.y - PickerSize.h
  }

  const left = Math.min(
    props.position.x + Offset.x,
    window.innerWidth - PickerSize.w - 20,
  )

  const style = {
    ...PickerStyle,
    top,
    left,
  } as CSSProperties

  return (
    <div
      className="color-picker__overlay"
      onClick={handleOnClick}
      onDragStart={eventCancel}
      onPointerDown={eventCancel}
    >
      <div style={style} onClick={eventCancel}>
        <SketchPicker
          disableAlpha={true}
          color={props.color}
          onChange={props.onChange}
          onChangeComplete={props.onChangeComplete}
          presetColors={PresetColors}
        />
      </div>
    </div>
  )
}
