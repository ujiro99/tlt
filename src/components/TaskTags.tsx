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

type TagMenuProps = {
  open: (e: MouseEvent) => void
}

function TagMenu(props: TagMenuProps): JSX.Element {
  const [hoverRef, isHovered, event] = useHover(200)

  const click = (e: React.MouseEvent) => {
    props.open(e.nativeEvent)
    eventStop(e)
  }

  useEffect(() => {
    if (isHovered && event) {
      props.open(event)
    }
  }, [isHovered])

  return (
    <div
      className="TagMenu"
      onClick={click}
      ref={hoverRef as React.Ref<HTMLDivElement>}
    >
      <Icon name="more-horiz" />
    </div>
  )
}

type Props = {
  tags: Tag[]
  onChange: (tags: Tag[]) => void
}

export function TaskTags(props: Props): JSX.Element {
  const [pickerVisible, setPickerVisible] = useState(false)
  const [pickerPosition, setPickerPosition] = useState<Position>()

  const showPicker = (e: MouseEvent) => {
    setPickerPosition({ x: e.clientX, y: e.clientY })
    setPickerVisible(true)
  }

  const closePicker = () => {
    setPickerVisible(false)
  }

  const tags = props.tags.slice(0, TagCountMax)
  const isOmit = props.tags.length > TagCountMax

  return (
    <div className="TaskTags">
      {!isOmit && (
        <div className="TaskTags--hover-only">
          <TagMenu open={showPicker} />
        </div>
      )}
      {tags.map((tag) => (
        <TaskTag key={tag.name} tag={tag} />
      ))}
      {isOmit && <TagMenu open={showPicker} />}
      <TagPicker
        visible={pickerVisible}
        position={pickerPosition}
        onRequestClose={closePicker}
        onChange={props.onChange}
        initialTags={props.tags} // Not omitted here.
      />
    </div>
  )
}
