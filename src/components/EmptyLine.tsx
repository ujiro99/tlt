import React from 'react'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useEditable } from '@/hooks/useEditable'
import { LineEditor } from '@/components/LineEditor'

export const EmptyLine: React.FC<unknown> = (): JSX.Element => {
  const manager = useTaskManager()
  const line = manager.lineCount + 1
  const [isEditing, focusOrEdit] = useEditable(line)

  if (isEditing) {
    return <LineEditor className="m-2" line={line} />
  }
  return (
    <div
      tabIndex={0}
      className="h-[40px] rounded-l m-2 mb-0 hover:bg-gray-100 focus:bg-indigo-50 cursor-pointer group text-center leading-10"
      onClick={focusOrEdit}
    >
      <span className="text-gray-600 opacity-0 group-hover:opacity-100 duration-200 transition-opacity group-hover:duration-500">
        Add a new task.
      </span>
    </div>
  )
}
