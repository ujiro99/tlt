import React, { useState } from 'react'
import classnames from 'classnames'
import { TagPicker } from '@/components/Tag/TagPicker'
import { Icon } from '@/components/Icon'
import { Position } from '@/components/BasePicker'
import { eventStop } from '@/services/util'
import { Tag } from '@/models/tag'

import './TagMenu.css'

export type TagMenuProps = {
  tags: Tag[]
  onChangeTags: (tags: Tag[]) => void
}

export function TagMenu(props: TagMenuProps): JSX.Element {
  const [pickerVisible, setPickerVisible] = useState(false)
  const [pickerPosition, setPickerPosition] = useState<Position>()

  const showPicker = (e: React.MouseEvent | MouseEvent) => {
    eventStop(e)
    setPickerPosition({ x: e.clientX, y: e.clientY })
    setPickerVisible(true)
  }

  const closePicker = () => {
    setPickerVisible(false)
  }

  const className = classnames('TagMenu', {
    'TagMenu--show-picker': pickerVisible,
  })

  return (
    <>
      <div className={className} onClick={showPicker} >
        <Icon name="tag" />
      </div>
      <TagPicker
        visible={pickerVisible}
        position={pickerPosition}
        onRequestClose={closePicker}
        onChange={props.onChangeTags}
        initialTags={props.tags} // Not omitted here.
      />
    </>
  )
}
