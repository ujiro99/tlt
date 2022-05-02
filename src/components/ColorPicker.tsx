import React, { CSSProperties } from 'react'
import { SketchPicker, ColorResult } from 'react-color'
import { unique } from '@/services/util'

import './ColorPicker.css'

const PickerSize = {
  w: 220,
  h: 300,
}

const Offset = {
  x: 0,
  y: 20,
}

const PresetMax = 16

const PickerStyle = {
  position: 'absolute',
} as CSSProperties

const PresetColors = [
  '#e91e63',
  '#f78da7',
  '#f47373',
  '#dce775',
  '#37d67a',
  '#009688',
  '#2ccce4',
  '#4a90e2',
  '#ba68c8',
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
  initialColor: string
  position: Position
  presetColors?: string[]
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

  let presets = unique(props.presetColors) || []
  if (presets.length < PresetMax) {
    presets = unique(presets.concat(PresetColors))
    if (presets.length > PresetMax) {
      presets = presets.slice(0, PresetMax)
    }
  }

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
          color={props.initialColor}
          onChange={props.onChange}
          onChangeComplete={props.onChangeComplete}
          presetColors={presets}
        />
      </div>
    </div>
  )
}
