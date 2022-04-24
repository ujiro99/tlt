import React from 'react'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useEditable } from '@/hooks/useEditable'
import { LineEditor } from '@/components/LineEditor'

export const EmptyLine: React.FC<unknown> = (): JSX.Element => {
  const manager = useTaskManager()
  const line = manager.lineCount + 1
  const [isEditing, _, edit] = useEditable(line)

  if (isEditing) {
    return <LineEditor className="m-2" line={line} />
  }

  return (
    <div
      tabIndex={0}
      className="h-[40px] rounded-xl m-2 mb-0 border border-gray-200 hover:bg-gray-100 focus:bg-indigo-50 cursor-pointer group text-center leading-10"
      onClick={edit}
    >
      <span className="text-gray-600 group-hover:opacity-100 duration-200 transition-opacity group-hover:duration-500">
        + new ToDo.
      </span>
    </div>
  )
}
