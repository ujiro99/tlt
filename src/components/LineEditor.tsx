import React, { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { TaskTextState } from '@/services/state'
import { useEditFinish } from '@/hooks/useEditable'

type Props = {
  line: number
}

export function LineEditor(props: Props): JSX.Element {
  const line = props.line
  const state = TaskTextState()
  const [text, setText] = useState("")
  const finishEdit = useEditFinish()

  function onBlur() {
    state.setTextByLine(line, text)
  }

  function onFocus() {
    setText(state.getTextByLine(line))
  }

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      state.setTextByLine(line, text)
      finishEdit()
    }
  }

  return (
    <TextareaAutosize
      className="w-full py-2 leading-relaxed outline-0 mb-[-5px] min-h-[40px]"
      value={text}
      onBlur={onBlur}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      autoFocus
    />
  )
}
