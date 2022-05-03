import React, { useState } from 'react'
import { Tag } from '@/models/tag'
import { TaskTag } from '@/components/TaskTag'
import { TagPicker } from '@/components/TagPicker'
import { Icon } from '@/components/Icon'
import { Position } from '@/components/BasePicker'
import { eventStop } from '@/services/util'

import './TaskTags.css'

const TagCountMax = 2

type TagMenuProps = {
  onClick: (e: React.MouseEvent) => void
}

function TagMenu(props: TagMenuProps): JSX.Element {
  const click = (e: React.MouseEvent) => {
    props.onClick(e)
    eventStop(e)
  }

  return (
    <div className="TagMenu" onClick={click}>
      <Icon name="more-horiz" />
    </div>
  )
}

type Props = {
  tags: Tag[],
  onChange: (tags: Tag[]) => void
}

export function TaskTags(props: Props): JSX.Element {
  const tags = props.tags
  const [pickerVisible, setPickerVisible] = useState(false)
  const [pickerPosition, setPickerPosition] = useState<Position>()

  const showPicker = (e: React.PointerEvent) => {
    setPickerPosition({ x: e.clientX, y: e.clientY })
    setPickerVisible(true)
  }

  if (tags.length > TagCountMax) {
    return (
      <>
        {tags.slice(0, TagCountMax).map((tag) => (
          <TaskTag key={tag.name} tag={tag} />
        ))}
        <TagMenu onClick={showPicker} />
        {pickerVisible ? (
          <TagPicker
            position={pickerPosition}
            onRequestClose={() => setPickerVisible(false)}
            onChange={props.onChange}
            initialTags={tags}
          />
        ) : null}
      </>
    )
  }

  return (
    <>
      {tags.map((tag) => (
        <TaskTag key={tag.name} tag={tag} />
      ))}
    </>
  )
}
