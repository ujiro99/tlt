import React, { useState, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import { TagButton } from '@/components/Tag/TagButton'
import { BasePicker, BasePickerProps } from '@/components/BasePicker'
import { Tag } from '@/models/tag'
import { useTagHistory } from '@/hooks/useTagHistory'
import { difference, eventStop } from '@/services/util'
import { Task } from '@/models/task'
import { COLOR, KEYCODE_ENTER } from '@/const'
import * as i18n from '@/services/i18n'

import '@/css/fadeIn.css'
import './TagPicker.css'

type Props = {
  visible: boolean
  refElm: Element
  onChange: (tags: Tag[]) => void
  initialTags: Tag[]
} & BasePickerProps

export const TagPicker = (props: Props): JSX.Element => {
  const [currentTags, setCurrentTags] = useState(props.initialTags)
  const [inputTxt, setInputTxt] = useState('')
  const [tmpTag, setTmpTag] = useState<string>(null)
  const { tags, upsertTag } = useTagHistory()

  useEffect(() => {
    props.onChange(currentTags)
  }, [currentTags])

  useEffect(() => {
    if (tmpTag) {
      addTag(null, tmpTag)
    }
    setTmpTag(null)
  }, [tmpTag])

  const additionalTags = difference(
    tags,
    currentTags,
    (a, b) => a.name === b.name,
  ).filter((tag) => tag.name.match(inputTxt))

  let newTag
  let isSelected = currentTags.find((t) => t.name === inputTxt)
  let showNewTag = additionalTags.length === 0 && inputTxt != '' && !isSelected
  if (showNewTag) {
    const parsed = Task.parseTags(`#${inputTxt.replace(/^#+/, '')}`)
    newTag = parsed[0]
    showNewTag = showNewTag && newTag != null
  }

  const exactMatch = additionalTags.find((t) => t.name === inputTxt)
  const isNarrowedToOne = additionalTags.length === 1

  const addTag = (e: React.SyntheticEvent, tagName: string) => {
    const tag = tags.find((t) => t.name === tagName)
    if (tag) setCurrentTags([...currentTags, tag])
    eventStop(e)
  }

  const removeTag = (e: React.MouseEvent, tagName: string) => {
    setCurrentTags(currentTags.filter((t) => t.name !== tagName))
    eventStop(e)
  }

  const createTag = (e) => {
    if (!newTag) return eventStop(e)
    upsertTag({ ...newTag, colorHex: COLOR.Gray200 })
    setInputTxt('')
    setTmpTag(newTag.name)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.keyCode === KEYCODE_ENTER) {
      if (showNewTag) {
        createTag(e)
      } else if (isNarrowedToOne) {
        addTag(e, additionalTags[0].name)
        setInputTxt('')
      } else if (exactMatch) {
        addTag(e, exactMatch.name)
        setInputTxt('')
      }
    }
    // Prevent key events to reach the SortableTree.
    e.stopPropagation()
  }

  const handleChange = (e) => {
    setInputTxt(e.target.value)
  }

  return (
    <CSSTransition
      in={props.visible}
      timeout={200}
      classNames="fade"
      unmountOnExit
    >
      <BasePicker onRequestClose={props.onRequestClose} refElm={props.refElm}>
        <div className="TagPicker">
          <div className="TagPicker__input">
            <input
              type="text"
              value={inputTxt}
              onChange={handleChange}
              onKeyDown={onKeyDown}
              placeholder="Filter or Create"
            />
          </div>
          <div className="TagPicker__current">
            <span className="TagPicker__label">{i18n.t('current_tags')}</span>
            {currentTags.map((t) => (
              <TagButton tag={t} key={t.name} onClick={removeTag} />
            ))}
          </div>
          <div className="TagPicker__history">
            <span className="TagPicker__label">{i18n.t('add_tags')}</span>
            {tags.length === 0 && <span>{i18n.t('no_tags')}</span>}
            {additionalTags.map((t) => (
              <TagButton
                tag={t}
                key={t.name}
                onClick={addTag}
                selected={isNarrowedToOne || t.name === inputTxt}
                enableDelete={true}
              />
            ))}
            {showNewTag ? (
              <div className="TagPicker__create">
                <span>Create New: </span>
                <TagButton tag={newTag} key={inputTxt} onClick={createTag} />
              </div>
            ) : null}
          </div>
        </div>
      </BasePicker>
    </CSSTransition>
  )
}
