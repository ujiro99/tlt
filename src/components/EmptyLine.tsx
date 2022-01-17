import React from 'react'
import { TaskTextState } from '@/services/state'
import { useEditable } from '@/hooks/useEditable'
import { LineEditor } from '@/components/LineEditor'

export const EmptyLine: React.FC<unknown> = (): JSX.Element => {
  const state = TaskTextState()
  const line = state.lineCount + 1
  const [isEditing, focusOrEdit] = useEditable(line)

  if (isEditing) {
    return <LineEditor line={line} />
  }
  return (
    <div
      tabIndex={0}
      className="h-[40px] focus:bg-indigo-50 cursor-pointer"
      onClick={focusOrEdit}
    ></div>
  )
}
