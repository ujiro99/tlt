import React, { useState } from 'react'
import { ColorResult } from 'react-color'
import { Tag } from '@/models/tag'
import { lightenDarkenColor } from '@/services/util'
import { ColorPicker, Position } from '@/components/ColorPicker'

type Props = {
  tag: Tag
}

const Gray200 = '#e2e8f0'
const Gray700 = '#334155'

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
  const [pickerPosition, setPickerPosition] = useState<Position>()

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

  const togglePicker = () => {
    setPickerVisible(!pickerVisible)
  }

  const showPicker = (e: React.MouseEvent) => {
    setPickerPosition({ x: e.clientX, y: e.clientY })
    setPickerVisible(true)
    e.stopPropagation()
  }

  return (
    <div
      className="inline-block px-2 ml-1 font-mono text-xs select-none rounded-xl leading-5"
      style={{ backgroundColor: bgColor }}
      onClick={showPicker}
    >
      <span style={{ color: labelColor }}>{toString(tag)}</span>
      {pickerVisible ? (
        <ColorPicker
          onClick={togglePicker}
          onChange={handleChange}
          onChangeComplete={handleChange}
          color={bgColor}
          position={pickerPosition}
        />
      ) : null}
    </div>
  )
}
