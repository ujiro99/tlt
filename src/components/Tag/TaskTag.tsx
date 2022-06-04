import React, { useState } from 'react'
import { ColorResult } from 'react-color'
import { Tag } from '@/models/tag'
import { TagButton } from '@/components/Tag/TagButton'
import { Position } from '@/components/BasePicker'
import { ColorPicker } from '@/components/ColorPicker'
import { useTagHistory } from '@/hooks/useTagHistory'
import { COLOR } from '@/const'

type Props = {
  tag: Tag
}

export const TaskTag = (props: Props): JSX.Element => {
  const tag = props.tag
  const [pickerVisible, setPickerVisible] = useState(false)
  const [pickerPosition, setPickerPosition] = useState<Position>()
  const { tags, setTag } = useTagHistory()
  const tagRecord = tags.find((t) => t.name === tag.name)
  const bgColor = tagRecord?.colorHex || COLOR.Gray200

  const presetColors = tags.map((t) => t.colorHex).reverse()

  const handleChange = (color: ColorResult) => {
    setTag({ name: tag.name, colorHex: color.hex })
  }

  const showPicker = (e: React.MouseEvent) => {
    setPickerPosition({ x: e.clientX, y: e.clientY })
    setPickerVisible(true)
    e.stopPropagation()
  }

  return (
    <>
      <TagButton tag={tag} onClick={showPicker} />

      {pickerVisible ? (
        <ColorPicker
          onRequestClose={() => setPickerVisible(false)}
          onChange={handleChange}
          onChangeComplete={handleChange}
          initialColor={bgColor}
          position={pickerPosition}
          presetColors={presetColors}
        />
      ) : null}
    </>
  )
}
