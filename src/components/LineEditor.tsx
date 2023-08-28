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
  const finishEdit = useEditFinish()
  const [text, setText] = useState('')
  const [autocompleteVisible, setAutocompleteVisible] = useState(false)
  const [activeAutocomplete, activateAutocomplete] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>()
  const autocompleteRef = useRef<HTMLDivElement>()

  useEffect(() => {
    let current = manager.getTextByLine(line)
    if (!current) {
      current = TASK_DEFAULT
    }
    analytics.track('edit line start')
    setText(current)
  }, [])

  function save() {
    manager.setTextByLine(line, text)
  }

  function finish() {
    if (text === TASK_DEFAULT) {
      manager.removeLine(line)
    }
    finishEdit()
    analytics.track('edit line fnish')
  }

  function onBlur() {
    window.setTimeout(() => {
      if (editorRef.current === document.activeElement) return
      save()
      finish()
    }, 100)
  }

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    setTimeout(() => {
      activateAutocomplete(true)
    }, 500)
  }

  function forwardEvent(e: React.KeyboardEvent) {
    // Propagate keyboard event to autocomplete component
    if (autocompleteVisible && autocompleteRef.current) {
      let clone = new KeyboardEvent(e.nativeEvent.type, e.nativeEvent)
      autocompleteRef.current.dispatchEvent(clone)
      e.preventDefault()
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.keyCode === KEYCODE_ENTER) {
      if (autocompleteVisible) {
        forwardEvent(e)
      } else {
        save()
        finish()
      }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      forwardEvent(e)
    }

    eventStop(e)
  }

  function handleComplete(value: string) {
    setText(value)
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
          onVisibleChange={setAutocompleteVisible}
          ref={autocompleteRef}
        />
      )}
    </>
  )
}
