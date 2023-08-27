import React, { useState, useEffect, useRef } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { useTaskManager } from '@/hooks/useTaskManager'
import { useEditFinish } from '@/hooks/useEditable'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Autocomplete } from '@/components/Autocomplete'
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
  const [activeAutocomplete, activateAutocomplete] = useState(false)
  const finishEdit = useEditFinish()
  const editorRef = useRef<HTMLTextAreaElement>()

  useEffect(() => {
    let current = manager.getTextByLine(line)
    if (!current) {
      current = TASK_DEFAULT
    }
    analytics.track('edit line start')
    setText(current)
  }, [])

  function save() {
    console.warn('save')
    manager.setTextByLine(line, text)
  }

  function finish() {
    console.warn('finish')
    if (text === TASK_DEFAULT) {
      manager.removeLine(line)
    }
    // finishEdit()
    analytics.track('edit line fnish')
  }

  function onBlur() {
    window.setTimeout(() => {
      if (editorRef.current === document.activeElement) return
      save()
      finish()
    }, 50)
  }

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    setTimeout(() => {
      activateAutocomplete(true)
    }, 500)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.keyCode === KEYCODE_ENTER) {
      save()
      finish()
    }
    eventStop(e)
  }

  function handleComplete(val: string) {
    setText(val)
    editorRef.current.focus()
  }

  return (
    <>
      <TextareaAutosize
        className={`line-editor ${props.className}`}
        value={text}
        onBlur={onBlur}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onDragStart={eventStop}
        onPointerDown={eventStop}
        ref={editorRef}
        autoFocus
      />
      {activeAutocomplete && (
        <Autocomplete
          text={text}
          editorRef={editorRef}
          onComplete={handleComplete}
        />
      )}
    </>
  )
}
