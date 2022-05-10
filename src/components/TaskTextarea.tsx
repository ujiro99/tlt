import React, { useState, useEffect, useRef } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { useTaskManager } from '@/hooks/useTaskManager'
import { useStorageWatcher } from '@/hooks/useStorageWatcher'
import { depthToIndent } from '@/models/node'
import { Task } from '@/models/task'
import { Group } from '@/models/group'
import { LoadingIcon } from '@/components/LoadingIcon'
import { sleep, getIndent } from '@/services/util'
import * as i18n from '@/services/i18n'
import { INDENT_SIZE, KEY, KEYCODE_ENTER, DEFAULT } from '@/const'

const INDENT = depthToIndent(1)

type Selection = {
  start: number
  end: number
}

export function TaskTextarea(): JSX.Element {
  const manager = useTaskManager()
  const [saving] = useStorageWatcher()
  const [text, setText] = useState(manager.getText())
  const [timeoutID, setTimeoutID] = useState<number>()
  const [iconVisible, setIconVisible] = useState(false)
  const [selection, setSelection] = useState<Selection>()
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
    if (selection && selection.start && selection.end) {
      inputArea.current.setSelectionRange(selection.start, selection.end)
    }
  }, [selection])

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
    if (e.keyCode === KEYCODE_ENTER) {
      // KeyCode is used to distinguish it from the Enter key input during IME
      const start = inputArea.current.selectionStart
      const end = inputArea.current.selectionEnd
      if (start !== end) return
      if (e.shiftKey) return

      const lines = text.split(/\n/)
      const prevPos = text.slice(0, start).split(/\n/).length - 1
      const prevLine = lines[prevPos]
      let rowAdd: string
      if (Task.isTaskStr(prevLine)) {
        // Add a new task as sibling level.
        rowAdd = getIndent(prevLine) + DEFAULT
      } else if (Group.test(prevLine)) {
        // Add a new task as child level.
        rowAdd = getIndent(prevLine) + INDENT + DEFAULT
      }

      lines.splice(prevPos + 1, 0, rowAdd)
      const newText = lines.join('\n')
      setText(newText)
      const newPos = lines.slice(0, prevPos + 2).join('\n').length
      setSelection({ start: newPos, end: newPos })

      e.preventDefault()
      return
    }

    switch (e.code) {
      case KEY.TAB: {
        const start = inputArea.current.selectionStart
        const from = text.slice(0, start).split(/\n/).length - 1
        const end = inputArea.current.selectionEnd
        const to = text.slice(0, end).split(/\n/).length - 1

        let newText: string
        if (e.shiftKey) {
          newText = indent(-1, from, to)

          // Ensure that the rows in the selection area do not change.
          const newLines = newText.split(/\n/)
          const fromMin = newLines.slice(0, from).join('\n').length + 1
          const newFrom = Math.max(fromMin, start - INDENT_SIZE)
          const toMin = newLines.slice(0, to).join('\n').length + 1
          const newEnd = Math.max(toMin, end - INDENT_SIZE * (to - from + 1))
          setSelection({ start: newFrom, end: newEnd })
        } else {
          newText = indent(1, from, to)
          setSelection({
            start: start + INDENT_SIZE,
            end: end + INDENT_SIZE * (to - from + 1),
          })
        }

        setText(newText)
        e.preventDefault()
        break
      }
    }
  }

  return (
    <div className="task-textarea">
      {iconVisible ? (
        <LoadingIcon>
          <span>{i18n.t('saving')}</span>
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
