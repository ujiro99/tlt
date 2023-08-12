import React, { useState, useEffect, useRef, CSSProperties } from 'react'
import classnames from 'classnames'
import { Tag } from '@/models/tag'
import { useTagHistory } from '@/hooks/useTagHistory'
import { tag2str, eventStop, rand } from '@/services/util'
import { useContextMenu } from '@/lib/react-contexify'
import { TagContextMenu } from '@/components/Tag/TagContextMenu'
import Log from '@/services/log'

import { calcAPCA, reverseAPCA, sRGBtoY } from 'apca-w3'
import { colorParsley } from 'colorparsley'

import './TagButton.css'

const Gray200 = '#e2e8f0'
const White = '#ffffff'
const Black = '#000000'

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

const calcApcaFg = (lc: number, bgColor: string): string => {
  const knownY = sRGBtoY(colorParsley(bgColor))
  let fgColor = reverseAPCA(lc, knownY, 'bg', 'hex') // dark color
  if (!fgColor) {
    fgColor = reverseAPCA(lc * -1, knownY, 'bg', 'hex') // light color
  }
  return fgColor
}

const calcLabelColor = (bgColor: string): string => {
  let col = calcApcaFg(75, bgColor)
  if (col) {
    return col
  } else {
    let lcb = Math.abs(calcAPCA(Black, bgColor))
    let lcw = Math.abs(calcAPCA(White, bgColor))
    return lcb > lcw + 5 ? Black : White
  }
}

type TagButtonProps = {
  onClick: (e: React.MouseEvent, tagName: string) => void
  tag: Tag
  pickerRef?: React.MutableRefObject<Element>
  selected?: boolean
  enableDelete?: boolean
}

const MENU_ID_PREFIX = 'tag-button-'

export const TagButton = (props: TagButtonProps): JSX.Element => {
  const tag = props.tag
  const { tags } = useTagHistory()
  const tagRecord = tags.find((t) => t.name === tag.name)
  const initialBg = tagRecord?.colorHex || Gray200
  const [bgColor, setBgColor] = useState(initialBg)
  const [fbColor, setFbColor] = useState(calcLabelColor(initialBg))

  const MENU_ID = MENU_ID_PREFIX + tag.name + rand()
  const { show } = useContextMenu({ id: MENU_ID })
  const pickerRef = props.pickerRef ?? useRef<Element>(null)

  let Lc = calcAPCA(fbColor, bgColor)
  Log.d('TagButton', tag.name, `fb: ${fbColor}`, `bg: ${bgColor}`, Lc)

  function openContextMenu(event) {
    show({ event })
    eventStop(event)
  }

  useEffect(() => {
    const tagRecord = tags.find((t) => t.name === tag.name)
    if (tagRecord) {
      setBgColor(tagRecord.colorHex)
      setFbColor(calcLabelColor(tagRecord.colorHex))
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
        <span style={{ color: fbColor }}>{tag2str(tag)}</span>
      </button>

      {/* context menu */}
      <TagContextMenu
        id={MENU_ID}
        tag={tag}
        tagRef={pickerRef}
        enableDelete={props.enableDelete}
      />
    </>
  )
}
