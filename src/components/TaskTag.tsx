import React from 'react'
import { Tag } from '@/models/task'

type Props = {
  tag: Tag
}

export const TaskTag = (props: Props): JSX.Element => {
  const tag = props.tag
  return (
    <div className="px-2 pt-[3px] pb-1 ml-1 font-mono text-xs rounded-xl bg-gray-200 text-gray-500 leading-3 inline-block">
      {tag.name}
    </div>
  )
}
