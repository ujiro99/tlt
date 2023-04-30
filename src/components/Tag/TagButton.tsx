import React, { useState, useEffect, useRef, CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import classnames from 'classnames'
import { Tag } from '@/models/tag'
import { useTagHistory } from '@/hooks/useTagHistory'
import { tag2str } from '@/services/util'
import { eventStop } from '@/services/util'
import { useContextMenu } from '@/lib/react-contexify'
import { TagContextMenu } from '@/components/Tag/TagContextMenu'

import './TagButton.css'

const Gray50 = '#f9fafb'
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

const calcLabelColor = (rgb: string): string => {
  const hsv = hex2hsv(rgb)
  return hsv.s < 0.4 && hsv.v > 0.6 ? Gray700 : Gray50
}

type TagButtonProps = {
  onClick: (e: React.MouseEvent, tagName: string) => void
  tag: Tag
  pickerRef?: React.MutableRefObject<Element>
  selected?: boolean
  enableDelete?: boolean
}

const MENU_ID_PREFIX = 'tag-button-'

function Portal({ children }) {
  return createPortal(children, document.getElementById('popup'))
}

export const TagButton = (props: TagButtonProps): JSX.Element => {
  const tag = props.tag
  const { tags } = useTagHistory()
  const tagRecord = tags.find((t) => t.name === tag.name)
  const initialBg = tagRecord?.colorHex || Gray200
  const [bgColor, setBgColor] = useState(initialBg)
  const [labelColor, setLabelColor] = useState(calcLabelColor(initialBg))

  const MENU_ID = MENU_ID_PREFIX + tag.name
  const { show } = useContextMenu({ id: MENU_ID })
  
  const pickerRef = props.pickerRef ?? useRef<Element>(null)

  function openContextMenu(event) {
    show({ event })
    eventStop(event)
  }

  useEffect(() => {
    const tagRecord = tags.find((t) => t.name === tag.name)
    if (tagRecord) {
      setBgColor(tagRecord.colorHex)
      setLabelColor(calcLabelColor(tagRecord.colorHex))
    }
  }, [tags])

  const style = {
    backgroundColor: bgColor,
    '--shadow-color': hex2rgb(bgColor),
  } as CSSProperties

  return (
    <>
      <button
        className={classnames('TagButton', { 'mod-selected': props.selected })}
        name={tag.name}
        style={style}
        onClick={(e) => props.onClick(e, tag.name)}
        onContextMenu={openContextMenu}
        ref={pickerRef as React.LegacyRef<HTMLButtonElement>}
      >
        <span style={{ color: labelColor }}>{tag2str(tag)}</span>
      </button>

      {/* context menu */}
      <Portal>
        <TagContextMenu
          id={MENU_ID}
          tag={tag}
          tagRef={pickerRef}
          enableDelete={props.enableDelete}
        />
      </Portal>
    </>
  )
}
