import React from 'react'

import { TaskListState } from '@/services/state'

export function TaskTextarea(): JSX.Element {
  const state = TaskListState()

  const onChange = ({ target: { value } }) => {
    void state.setText(value)
  }

  return (
    <div className="task-textarea">
      <textarea className="" onChange={onChange} value={state.text}></textarea>
    </div>
  )
}

