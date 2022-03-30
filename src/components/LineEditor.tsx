import React, { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { useTaskManager } from '@/hooks/useTaskManager'
import { useEditFinish } from '@/hooks/useEditable'

type Props = {
  line: number
  className?: string
}

const DEFAULT = "- [ ] ";
const KEYCODE_ENTER = 13

export function LineEditor(props: Props): JSX.Element {
  const line = props.line
  const manager = useTaskManager()
  const [text, setText] = useState('')
  const finishEdit = useEditFinish()

  function finish() {
    if (text !== DEFAULT) {
      manager.setTextByLine(line, text)
    }
    finishEdit()
  }

  function onBlur() {
    finish()
  }

  function onFocus() {
    let current = manager.getTextByLine(line);
    if (!current) {
      current = DEFAULT
    }
    setText(current)
  }

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.keyCode === KEYCODE_ENTER && !e.shiftKey) {
      finish()
    }
    // Prevent key events to reach the SortableTree.
    e.stopPropagation()
  }

  return (
    <TextareaAutosize
      className={`${props.className} w-full py-2 leading-relaxed outline-0 mb-[-5px] min-h-[40px] cursor-text`}
      value={text}
      onBlur={onBlur}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      autoFocus
    />
  )
}
