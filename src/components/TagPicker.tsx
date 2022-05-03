import React, { useState, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import { TagButton } from '@/components/TagButton'
import {
  BasePicker,
  BasePickerProps,
  EVENT_TYPE,
} from '@/components/BasePicker'
import { Tag } from '@/models/tag'
import { useTagHistory } from '@/hooks/useTagHistory'
import { difference } from '@/services/util'

import '@/css/fadeIn.css'

import './TagPicker.css'

const PickerSize = {
  w: 200,
  h: 250,
}

type Props = {
  visible: boolean
  onChange: (tags: Tag[]) => void
  initialTags: Tag[]
} & BasePickerProps

export const TagPicker = (props: Props): JSX.Element => {
  const [currentTags, setCurrentTags] = useState(props.initialTags)
  const { tags } = useTagHistory()

  useEffect(() => {
    props.onChange(currentTags)
  }, [currentTags])

  const additionalTags = difference(
    tags,
    currentTags,
    (a, b) => a.name === b.name,
  )

  const addTag = (_: React.MouseEvent, tagName: string) => {
    const tag = tags.find((t) => t.name === tagName)
    if (tag) setCurrentTags([...currentTags, tag])
  }

  const removeTag = (_: React.MouseEvent, tagName: string) => {
    setCurrentTags(currentTags.filter((t) => t.name !== tagName))
  }

  return (
    <CSSTransition
      in={props.visible}
      timeout={200}
      classNames="fade"
      unmountOnExit
    >
      <BasePicker
        onRequestClose={props.onRequestClose}
        position={props.position}
        size={PickerSize}
        eventType={EVENT_TYPE.HOVER}
      >
        <div className="TagPicker">
          <div className="TagPicker__current">
            <span className="TagPicker__label">Current tags</span>
            {currentTags.map((t) => {
              return <TagButton tag={t} key={t.name} onClick={removeTag} />
            })}
          </div>
          <div className="TagPicker__history">
            <span className="TagPicker__label">Add tags</span>
            {additionalTags.map((t) => {
              return <TagButton tag={t} key={t.name} onClick={addTag} />
            })}
          </div>
        </div>
      </BasePicker>
    </CSSTransition>
  )
}
