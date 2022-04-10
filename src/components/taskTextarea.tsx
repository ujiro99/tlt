import React, { useState, useEffect } from 'react'

import { useTaskManager } from '@/hooks/useTaskManager'
import { useStorageWatcher } from '@/hooks/useStorageWatcher'

import { LoadingIcon } from '@/components/LoadingIcon'
import { sleep } from '@/services/util'

export function TaskTextarea(): JSX.Element {
  const manager = useTaskManager()
  const [saving] = useStorageWatcher()
  const [text, setText] = useState(manager.getText())
  const [timeoutID, setTimeoutID] = useState<number>()
  const [iconVisible, setIconVisible] = useState(false)

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

  return (
    <div className="task-textarea">
      {iconVisible ? (
        <LoadingIcon>
          <span>Saving...</span>
        </LoadingIcon>
      ) : null}
      <textarea
        className=""
        onChange={onChange}
        onBlur={onBlur}
        value={text}
      ></textarea>
    </div>
  )
}
