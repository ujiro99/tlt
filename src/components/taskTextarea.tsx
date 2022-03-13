import React from 'react'

import { useTaskManager } from '@/hooks/useTaskManager'

export function TaskTextarea(): JSX.Element {
  const manager = useTaskManager()

  const onChange = ({ target: { value } }) => {
    void manager.setText(value)
  }

  return (
    <div className="task-textarea">
      <textarea className="" onChange={onChange} value={manager.getText()}></textarea>
    </div>
  )
}

