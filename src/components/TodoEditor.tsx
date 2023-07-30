import React, { useState, useEffect, useRef } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { useTaskManager } from '@/hooks/useTaskManager'
import { useStorageWatcher } from '@/hooks/useStorageWatcher'
import { useTaskRecordKey } from '@/hooks/useTaskRecordKey'
import { useEventAlarm } from '@/hooks/useEventAlarm'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Task } from '@/models/task'
import { Group } from '@/models/group'
import { LoadingIcon } from '@/components/LoadingIcon'
import { Icon } from '@/components/Icon'
import {
  sleep,
  getIndent,
  depthToIndent,
  getIndentDepth,
} from '@/services/util'
import * as i18n from '@/services/i18n'
import { INDENT_SIZE, KEY, KEYCODE_ENTER, TASK_DEFAULT } from '@/const'
import Log from '@/services/log'

const INDENT = depthToIndent(1)

type Selection = {
  start: number
  end: number
}

export function TodoEditor(): JSX.Element {
  const manager = useTaskManager()
  const rootText = manager.getText()
  const [saving] = useStorageWatcher()
  const [text, setText] = useState('')
  const [timeoutID, setTimeoutID] = useState<number>()
  const [iconVisible, setIconVisible] = useState(false)
  const [iconHidden, setIconHidden] = useState(true)
  const [selection, setSelection] = useState<Selection>()
  const { currentKey } = useTaskRecordKey()
  const { fixEventLines } = useEventAlarm()
  const inputArea = useRef<HTMLTextAreaElement>()
  const analytics = useAnalytics()

  useEffect(() => {
    setText(rootText)
  }, [currentKey, rootText])

  useEffect(() => {
    setIconHidden(true)
    sleep(2000).then(() => setIconHidden(false))
  }, [currentKey])

  useEffect(() => {
    let unmounted = false
    if (timeoutID) clearTimeout(timeoutID)
    const newTimeoutId = window.setTimeout(() => {
      if (unmounted) return
      manager.setText(text)
      setTimeoutID(null)
    }, 1 * 500 /* ms */)

    setTimeoutID(newTimeoutId)

    return () => {
      unmounted = true
      clearTimeout(timeoutID)
    }
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
    const newRoot = manager.setText(text)
    fixEventLines(newRoot)
  }

  /**
   * Add/Remove indent.
   * @param depth Indent depth.
   * @param from Start row.
   * @param to End row.
   * @returns changed lines.
   */
  const changeIndent = (
    depth: number,
    from: number,
    to: number,
  ): [string, number, number] => {
    const lines = text.split(/\n/)
    const chagnedLines = []
    const increse = depth > 0
    depth = Math.abs(depth)
    let fromMoved = 0
    let toMoved = 0
    for (let i = from - 1; i <= to - 1; i++) {
      if (increse) {
        // Increase indent.
        const indent = depthToIndent(depth)
        chagnedLines.push(indent + lines[i])
        if (i === from - 1) fromMoved = indent.length
        toMoved += indent.length
      } else {
        // Decrease indent.
        const currentLine = lines[i]
        const currentDepth = getIndentDepth(currentLine)
        let d = depth
        if (currentDepth === 0) {
          d = 0
        } else if (currentDepth < depth) {
          d = currentDepth
        }
        chagnedLines.push(currentLine.slice(INDENT_SIZE * d))
        if (i === from - 1) fromMoved -= INDENT_SIZE * d
        toMoved -= INDENT_SIZE * d
      }
    }
    return [chagnedLines.join('\n'), fromMoved, toMoved]
  }

  /**
   * Calculate the start position of the row.
   * @param row Target row number.
   * @param lines
   * @returns Start position of the row
   */
  const calcRowStartPos = (row: number, lines: string[]): number => {
    if (row === 1) return 0
    return lines.slice(0, row - 1).join('\n').length + 1
  }

  /**
   * Calculate the end position of the row.
   * @param row Target row number.
   * @param lines
   * @returns End position of the row.
   */
  const calcRowEndPos = (row: number, lines: string[]): number => {
    let nl = 1
    if (row === 1) nl--
    return (
      lines.slice(0, row - 1).join('\n').length + lines[row - 1].length + nl
    )
  }

  /**
   * Set text at selected rows.
   * @param from Selected start row nubmer.
   * @param to Selected end row number.
   * @param newText Text to be set.
   * @param appendRow If true, append a new row at the end of the selected rows.
   */
  function setTextAtRow(
    from: number,
    to: number,
    newText: string,
    appendRow = false,
  ) {
    const lines = text.split(/\n/)
    if (appendRow) {
      newText = '\n' + newText
      const start = calcRowEndPos(from, lines)
      const end = calcRowEndPos(to, lines)
      inputArea.current.setSelectionRange(start, end)
    } else {
      const start = calcRowStartPos(from, lines)
      const end = calcRowEndPos(to, lines)
      inputArea.current.setSelectionRange(start, end)
    }

    let executed = true
    try {
      if (!document.execCommand('insertText', false, newText)) {
        executed = false
      }
    } catch (e) {
      analytics.track('ErrorInsertText')
      Log.e('error caught:', e)
      executed = false
    }
    if (!executed) {
      Log.e('insertText unsuccessful, execCommand not supported')
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.keyCode === KEYCODE_ENTER) {
      // KeyCode is used to distinguish it from the Enter key input during IME
      const start = inputArea.current.selectionStart
      const end = inputArea.current.selectionEnd
      if (start !== end) return
      if (e.shiftKey) return

      const lines = text.split(/\n/)
      let currentRow = text.slice(0, start).split(/\n/).length
      const currentLine = lines[currentRow - 1]
      if (Task.isEmptyTask(currentLine)) {
        const depth = getIndentDepth(currentLine)
        if (depth > 0) {
          // Decrease the indent of the current line.
          let replaceLine = depthToIndent(Math.max(depth - 1, 0)) + TASK_DEFAULT
          setTextAtRow(currentRow, currentRow, replaceLine)
        } else {
          // Set the current line to empty.
          let replaceLine = ''
          if (start === inputArea.current.value.length) {
            // The cause is unclear, but if you perform an operation to leave the last line empty,
            // the focus position gets messed up, so insert one line break.
            replaceLine = '\n'
          }
          setTextAtRow(currentRow, currentRow, replaceLine)
        }
      } else if (Task.isTaskStr(currentLine)) {
        // Add a new task as sibling level.
        const addedLine = getIndent(currentLine) + TASK_DEFAULT
        setTextAtRow(currentRow, currentRow, addedLine, true)
        currentRow++
      } else if (Group.test(currentLine)) {
        // Add a new task as child level.
        const addedLine = getIndent(currentLine) + INDENT + TASK_DEFAULT
        setTextAtRow(currentRow, currentRow, addedLine, true)
        currentRow++
      } else {
        // Add a empty line (default).
        return
      }

      const newPos = inputArea.current.value
        .split(/\n/)
        .slice(0, currentRow)
        .join('\n').length
      setSelection({ start: newPos, end: newPos })

      e.preventDefault()
      return
    }

    switch (e.code) {
      case KEY.TAB: {
        const start = inputArea.current.selectionStart
        const from = text.slice(0, start).split(/\n/).length
        const end = inputArea.current.selectionEnd
        const to = text.slice(0, end).split(/\n/).length

        let [newText, fromMoved, toMoved] = changeIndent(
          e.shiftKey ? -1 : 1,
          from,
          to,
        )
        setTextAtRow(from, to, newText)
        setSelection({
          start: start + fromMoved,
          end: end + toMoved,
        })

        e.preventDefault()
        break
      }
    }
  }

  return (
    <div className="task-textarea">
      {iconVisible && !iconHidden ? (
        <LoadingIcon>
          <span>{i18n.t('saving')}</span>
        </LoadingIcon>
      ) : null}
      <h3 className="task-textarea__section-title">
        <Icon name="task" />
        Tasks
      </h3>
      <TextareaAutosize
        className=""
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        ref={inputArea}
        defaultValue={text}
      ></TextareaAutosize>
    </div>
  )
}
