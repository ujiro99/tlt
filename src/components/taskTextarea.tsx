import React, { useState } from 'react'

import { useTaskManager } from '@/hooks/useTaskManager'

export function TaskTextarea(): JSX.Element {
  const manager = useTaskManager()
  const [text, setText] = useState(manager.getText())

  const onChange = ({ target: { value } }) => {
    setText(value)
  }

  const onBlur = () => {
    // Update the global scope data.
    manager.setText(text)
  }

  return (
    <div className="task-textarea">
      <textarea
        className=""
        onChange={onChange}
        onBlur={onBlur}
        value={text}
      ></textarea>
    </div>
  )
}
