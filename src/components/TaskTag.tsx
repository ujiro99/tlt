import React, { useState, useEffect, CSSProperties } from 'react'
import { ColorResult } from 'react-color'
import { Tag } from '@/models/tag'
import { lightenDarkenColor } from '@/services/util'
import { ColorPicker, Position } from '@/components/ColorPicker'
import { useTagColor } from '@/hooks/useTagColor'

import './TaskTag.css'

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

function hex2hsv(hex: string): Hsv {
  if (hex[0] === '#') {
    hex = hex.slice(1)
  }
  const num = parseInt(hex, 16)
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

  return { h, s: max === 0 ? 0 : diff / max, v: max }
}

function hex2rgb(hex: string): string {
  if (hex.slice(0, 1) === '#') hex = hex.slice(1)
  if (hex.length === 3)
    hex =
      hex.slice(0, 1) +
      hex.slice(0, 1) +
      hex.slice(1, 2) +
      hex.slice(1, 2) +
      hex.slice(2, 3) +
      hex.slice(2, 3)

  return [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)]
    .map((str) => parseInt(str, 16))
    .join(',')
}

function lighten(color: string): string {
  return lightenDarkenColor(color, 0.7, 0)
}

function darken(color: string): string {
  return lightenDarkenColor(color, -0.6, 10)
}

export const TaskTag = (props: Props): JSX.Element => {
  const tag = props.tag
  const [labelColor, setLabelColor] = useState(Gray700)
  const [pickerVisible, setPickerVisible] = useState(false)
  const [pickerPosition, setPickerPosition] = useState<Position>()
  const { tags, setTag } = useTagColor()

  const [bgColor, setBgColor] = useState(Gray200)

  useEffect(() => {
    const tagRecord = tags.find((t) => t.name === tag.name)
    if (tagRecord) {
      setBgColor(tagRecord.colorHex)
      updateLabelColor(tagRecord.colorHex)
    }
  }, [tags])

  const toString = (tag: Tag) => {
    return tag.quantity ? `${tag.name}:${tag.quantity}` : tag.name
  }

  const handleChange = (color: ColorResult) => {
    setBgColor(color.hex)
    setTag({ name: tag.name, colorHex: color.hex })
    updateLabelColor(color.hex)
  }

  const updateLabelColor = (rgb: string) => {
    const hsv = hex2hsv(rgb)
    const lc = hsv.s < 0.4 && hsv.v > 0.6 ? darken(rgb) : lighten(rgb)
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

  const style = {
    backgroundColor: bgColor,
    '--shadow-color': hex2rgb(bgColor),
  } as CSSProperties

  return (
    <>
      <div className="TaskTag" style={style} onClick={showPicker}>
        <span style={{ color: labelColor }}>{toString(tag)}</span>
      </div>
      {pickerVisible ? (
        <ColorPicker
          onClick={togglePicker}
          onChange={handleChange}
          onChangeComplete={handleChange}
          color={bgColor}
          position={pickerPosition}
        />
      ) : null}
    </>
  )
}
