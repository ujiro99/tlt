import React, { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { TaskTextState } from '@/services/state'
import { useEditFinish } from '@/hooks/useEditable'

type Props = {
  line: number
  className?: string
}

const DEFAULT = "- [ ] ";

export function LineEditor(props: Props): JSX.Element {
  const line = props.line
  const state = TaskTextState()
  const [text, setText] = useState('')
  const finishEdit = useEditFinish()

  function finish() {
    if (text !== DEFAULT) {
      state.setTextByLine(line, text)
    }
    finishEdit()
  }

  function onBlur() {
    finish()
  }

  function onFocus() {
    let current = state.getTextByLine(line);
    if (!current) {
      current = DEFAULT
    }
    setText(current)
  }

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      finish()
    }
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
