import React, { useState, useEffect, useRef } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { useTaskManager } from '@/hooks/useTaskManager'
import { useStorageWatcher } from '@/hooks/useStorageWatcher'
import { depthToIndent } from '@/models/node'
import { LoadingIcon } from '@/components/LoadingIcon'
import { sleep } from '@/services/util'
import { INDENT_SIZE, KEY, DEFAULT } from '@/const'

const INDENT = depthToIndent(1)

export function TaskTextarea(): JSX.Element {
  const manager = useTaskManager()
  const [saving] = useStorageWatcher()
  const [text, setText] = useState(manager.getText())
  const [timeoutID, setTimeoutID] = useState<number>()
  const [iconVisible, setIconVisible] = useState(false)
  const inputArea = useRef<HTMLTextAreaElement>()

  useEffect(() => {
    if (timeoutID) clearTimeout(timeoutID)
    const newTimeoutId = window.setTimeout(() => {
      manager.setText(text)
      setTimeoutID(null)
    }, 1 * 500 /* ms */)
    setTimeoutID(newTimeoutId)
  }, [text])

  useEffect(() => {
    async function updateVisible() {
      if (saving) {
        setIconVisible(true)
        await sleep(500)
        setIconVisible(false)
      }
    }
    void updateVisible()
  }, [saving])

  const onChange = ({ target: { value } }) => {
    setText(value)
  }

  const onBlur = () => {
    // Update the global scope data.
    manager.setText(text)
  }

  const indent = (indentCount: number, from: number, to: number): string => {
    const lines = text.split(/\n/)
    const indent = ''.padStart(Math.abs(indentCount) * INDENT_SIZE, INDENT)
    for (let i = from; i <= to; i++) {
      if (indentCount > 0) {
        // insert indent.
        lines[i] = indent + lines[i]
      } else {
        // remove indent.
        const currentLine = lines[i]
        if (currentLine.startsWith(indent)) {
          lines[i] = currentLine.slice(Math.abs(indentCount) * INDENT_SIZE)
        }
      }
    }
    return lines.join('\n')
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.code) {
      case KEY.TAB: {
        const start = inputArea.current.selectionStart
        const from = text.slice(0, start).split(/\n/).length - 1
        const end = inputArea.current.selectionEnd
        const to = text.slice(0, end).split(/\n/).length - 1

        let newText: string
        if (e.shiftKey) {
          newText = indent(-1, from, to)
          setTimeout(() => {
            inputArea.current.setSelectionRange(
              start - INDENT_SIZE,
              end - INDENT_SIZE * (to - from + 1),
            )
          }, 10)
        } else {
          newText = indent(1, from, to)
          setTimeout(() => {
            inputArea.current.setSelectionRange(
              start + INDENT_SIZE,
              end + INDENT_SIZE * (to - from + 1),
            )
          }, 10)
        }

        setText(newText)
        e.preventDefault()
        break
      }
    }
    // Prevent key events to reach the SortableTree.
    e.stopPropagation()
  }

  return (
    <div className="task-textarea">
      {iconVisible ? (
        <LoadingIcon>
          <span>Saving...</span>
        </LoadingIcon>
      ) : null}
      <TextareaAutosize
        className=""
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        value={text}
        ref={inputArea}
      ></TextareaAutosize>
    </div>
  )
}
