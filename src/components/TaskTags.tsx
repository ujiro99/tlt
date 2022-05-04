import React, { useState, useEffect } from 'react'
import { Tag } from '@/models/tag'
import { useHover } from '@/hooks/useHover'
import { TaskTag } from '@/components/TaskTag'
import { TagPicker } from '@/components/TagPicker'
import { Icon } from '@/components/Icon'
import { Position } from '@/components/BasePicker'
import { eventStop } from '@/services/util'

import './TaskTags.css'

const TagCountMax = 2

type TagMenuProps = Props

export function TagMenu(props: TagMenuProps): JSX.Element {
  const [pickerVisible, setPickerVisible] = useState(false)
  const [pickerPosition, setPickerPosition] = useState<Position>()
  const [hoverRef, isHovered, event] = useHover(200)

  const showPicker = (e: React.MouseEvent | MouseEvent) => {
    setPickerPosition({ x: e.clientX, y: e.clientY })
    setPickerVisible(true)
    eventStop(e)
  }

  const closePicker = () => {
    setPickerVisible(false)
  }

  useEffect(() => {
    if (isHovered && event) {
      showPicker(event)
    }
  }, [isHovered])

  return (
    <>
    <div
      className="TagMenu"
      onClick={showPicker}
      ref={hoverRef as React.Ref<HTMLDivElement>}
    >
      <Icon name="more-horiz" />
    </div>
      <TagPicker
        visible={pickerVisible}
        position={pickerPosition}
        onRequestClose={closePicker}
        onChange={props.onChange}
        initialTags={props.tags} // Not omitted here.
      />
    </>
  )
}

type Props = {
  tags: Tag[]
  onChange: (tags: Tag[]) => void
}

export function TaskTags(props: Props): JSX.Element {
  const tags = props.tags.slice(0, TagCountMax)
  const isOmit = props.tags.length > TagCountMax

  return (
    <div className="TaskTags">
      {!isOmit && (
        <div className="TaskTags--hover-only">
          <TagMenu tags={props.tags} onChange={props.onChange} />
        </div>
      )}
      {tags.map((tag) => (
        <TaskTag key={tag.name} tag={tag} />
      ))}
      {isOmit && <TagMenu tags={props.tags} onChange={props.onChange} />}
    </div>
  )
}
