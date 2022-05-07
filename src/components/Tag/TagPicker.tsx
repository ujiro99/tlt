import React, { useState, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import { TagButton } from '@/components/Tag/TagButton'
import {
  BasePicker,
  BasePickerProps,
  EVENT_TYPE,
} from '@/components/BasePicker'
import { Tag } from '@/models/tag'
import { useTagHistory } from '@/hooks/useTagHistory'
import { difference, eventStop } from '@/services/util'

import '@/css/fadeIn.css'

import './TagPicker.css'

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

  const addTag = (e: React.MouseEvent, tagName: string) => {
    const tag = tags.find((t) => t.name === tagName)
    if (tag) setCurrentTags([...currentTags, tag])
    eventStop(e)
  }

  const removeTag = (e: React.MouseEvent, tagName: string) => {
    setCurrentTags(currentTags.filter((t) => t.name !== tagName))
    eventStop(e)
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
            {additionalTags.length === 0 && <span>No tags yet.</span>}
            {additionalTags.map((t) => {
              return <TagButton tag={t} key={t.name} onClick={addTag} />
            })}
          </div>
        </div>
      </BasePicker>
    </CSSTransition>
  )
}
