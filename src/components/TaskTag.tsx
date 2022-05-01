import React, { useState, CSSProperties } from 'react'
import { SketchPicker, ColorResult } from 'react-color'
import { Tag } from '@/models/tag'
import { lightenDarkenColor } from '@/services/util'

import './TaskTag.css'

type Props = {
  tag: Tag
}

const Gray200 = '#e2e8f0'
const Gray700 = '#334155'

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

export const TaskTag = (props: Props): JSX.Element => {
  const [bgColor, setBgColor] = useState(Gray200)
  const [labelColor, setLabelColor] = useState(Gray700)
  const [pickerVisible, setPickerVisible] = useState(false)
  const [pickerStyle, setPickerStyle] = useState(PickerStyle)
  const tag = props.tag
  const toString = (tag: Tag) => {
    return tag.quantity ? `${tag.name}:${tag.quantity}` : tag.name
  }

  const handleChange = (color: ColorResult) => {
    setBgColor(color.hex)
    const lc =
      color.hsl.l > 0.5
        ? lightenDarkenColor(color.hex, -140)
        : lightenDarkenColor(color.hex, 180)
    setLabelColor(lc)
  }

  const eventCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const togglePicker = (e: React.MouseEvent) => {
    setPickerVisible(!pickerVisible)
    eventCancel(e)
  }

  const showPicker = (e: React.MouseEvent) => {
    let top = Math.min(
      e.clientY + Offset.y,
      window.innerHeight - PickerSize.h - 10,
    )
    if (window.innerHeight - (e.clientY + Offset.y + PickerSize.h) < 0) {
      top = e.clientY - Offset.y - PickerSize.h
    }

    const left = Math.min(
      e.clientX + Offset.x,
      window.innerWidth - PickerSize.w - 20,
    )

    setPickerStyle({
      ...pickerStyle,
      top,
      left,
    })
    setPickerVisible(true)
    eventCancel(e)
  }

  return (
    <div
      className="inline-block px-2 ml-1 font-mono text-xs rounded-xl leading-5"
      style={{ backgroundColor: bgColor }}
      onClick={showPicker}
    >
      <span style={{ color: labelColor }}>{toString(tag)}</span>
      {pickerVisible ? (
        <div
          className="color-picker__overlay"
          onClick={togglePicker}
          onDragStart={eventCancel}
          onPointerDown={eventCancel}
        >
          <div style={pickerStyle} onClick={eventCancel}>
            <SketchPicker
              disableAlpha={true}
              color={bgColor}
              onChange={handleChange}
              onChangeComplete={handleChange}
              presetColors={PresetColors}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
