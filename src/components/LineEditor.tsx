import React, { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { useTaskManager } from '@/hooks/useTaskManager'
import { useEditFinish } from '@/hooks/useEditable'
import { useAnalytics } from '@/hooks/useAnalytics'
import { eventStop } from '@/services/util'
import { TASK_DEFAULT, KEYCODE_ENTER } from '@/const'

import './LineEditor.css'

type Props = {
  line: number
  className?: string
}

export function LineEditor(props: Props): JSX.Element {
  const line = props.line
  const manager = useTaskManager()
  const analytics = useAnalytics()
  const [text, setText] = useState('')
  const finishEdit = useEditFinish()

  function finish() {
    if (text !== TASK_DEFAULT) {
      manager.setTextByLine(line, text)
    } else {
      manager.removeLine(line)
    }
    analytics.track('edit line fnish')
    finishEdit()
  }

  function onBlur() {
    finish()
  }

  function onFocus() {
    let current = manager.getTextByLine(line)
    if (!current) {
      current = TASK_DEFAULT
    }
    analytics.track('edit line start')
    setText(current)
  }

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.keyCode === KEYCODE_ENTER) {
      finish()
    }
    // Prevent key events to reach the SortableTree.
    e.stopPropagation()
  }

  return (
    <TextareaAutosize
      className={`line-editor ${props.className}`}
      value={text}
      onBlur={onBlur}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onDragStart={eventStop}
      onPointerDown={eventStop}
      autoFocus
    />
  )
}
