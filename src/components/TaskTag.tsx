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

type Hsv = {
  h: number
  s: number
  v: number
}

function rgb2hsv(rgb: string): Hsv {
  if (rgb[0] === '#') {
    rgb = rgb.slice(1)
  }
  const num = parseInt(rgb, 16)
  const r = (num >> 16) / 255
  const b = ((num >> 8) & 0x00ff) / 255
  const g = (num & 0x0000ff) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  let h = 0

  switch (min) {
    case max:
      h = 0
      break

    case r:
      h = 60 * ((b - g) / diff) + 180
      break

    case g:
      h = 60 * ((r - b) / diff) + 300
      break

    case b:
      h = 60 * ((g - r) / diff) + 60
      break
  }

  const s = max === 0 ? 0 : diff / max
  const v = max

  return { h, s, v }
}

function lighten(color: string): string {
  return lightenDarkenColor(color, 0.7, 0)
}

function darken(color: string): string {
  return lightenDarkenColor(color, -0.6, 10)
}

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
    const hsv = rgb2hsv(color.hex)
    const lc =
      hsv.s < 0.4 && hsv.v > 0.6 ? darken(color.hex) : lighten(color.hex)
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
      className="inline-block px-2 ml-1 font-mono text-xs select-none rounded-xl leading-5"
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
