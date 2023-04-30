import React, { useState, useRef } from 'react'
import { ColorResult } from 'react-color'
import { Tag } from '@/models/tag'
import { TagButton } from '@/components/Tag/TagButton'
import { ColorPicker } from '@/components/ColorPicker'
import { useTagHistory } from '@/hooks/useTagHistory'
import { COLOR } from '@/const'

type Props = {
  tag: Tag
}

export const TaskTag = (props: Props): JSX.Element => {
  const tag = props.tag
  const [pickerVisible, setPickerVisible] = useState(false)
  const refElm = useRef<Element>(null)
  const { tags, upsertTag } = useTagHistory()
  const tagRecord = tags.find((t) => t.name === tag.name)
  const bgColor = tagRecord?.colorHex || COLOR.Gray200

  const presetColors = tags.map((t) => t.colorHex).reverse()

  const handleChange = (color: ColorResult) => {
    upsertTag({ name: tag.name, colorHex: color.hex })
  }

  const showPicker = (e: React.MouseEvent) => {
    setPickerVisible(true)
    e.stopPropagation()
  }
  
  return (
    <>
      <TagButton tag={tag} onClick={showPicker} pickerRef={refElm} />

      {pickerVisible ? (
        <ColorPicker
          onRequestClose={() => setPickerVisible(false)}
          onChange={handleChange}
          onChangeComplete={handleChange}
          initialColor={bgColor}
          refElm={refElm.current}
          presetColors={presetColors}
        />
      ) : null}
    </>
  )
}
