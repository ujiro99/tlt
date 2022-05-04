import React, { useState, useEffect } from 'react'
import classnames from 'classnames'
import { useHover } from '@/hooks/useHover'
import { TagPicker } from '@/components/TagPicker'
import { Icon } from '@/components/Icon'
import { Position } from '@/components/BasePicker'
import { eventStop } from '@/services/util'
import { Tag } from '@/models/tag'

import './TagMenu.css'

export type TagMenuProps = {
  tags: Tag[]
  onChangeTags: (tags: Tag[]) => void
  onChangePicker?: (visible: boolean) => void
}

const noop = () => {
  /* nothing to do */
}

export function TagMenu(props: TagMenuProps): JSX.Element {
  const [pickerVisible, setPickerVisible] = useState(false)
  const [pickerPosition, setPickerPosition] = useState<Position>()
  const [hoverRef, isHovered, event] = useHover(200)

  const onChangePicker = props.onChangePicker || noop

  const showPicker = (e: React.MouseEvent | MouseEvent) => {
    eventStop(e)
    setPickerPosition({ x: e.clientX, y: e.clientY })
    setPickerVisible(true)
    onChangePicker(true)
  }

  const closePicker = () => {
    setPickerVisible(false)
    onChangePicker(false)
  }

  useEffect(() => {
    if (isHovered && event) {
      showPicker(event)
    }
  }, [isHovered])

  const className = classnames('TagMenu', {
    'TagMenu--show-picker': pickerVisible,
  })

  return (
    <>
      <div
        className={className}
        onClick={showPicker}
        ref={hoverRef as React.Ref<HTMLDivElement>}
      >
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
