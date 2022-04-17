import React from 'react'
import { Tag } from '@/models/tag'

type Props = {
  tag: Tag
}

export const TaskTag = (props: Props): JSX.Element => {
  const tag = props.tag
  const toString = (tag: Tag) => {
    return tag.quantity ? `${tag.name}:${tag.quantity}` : tag.name
  }
  return (
    <div className="inline-block px-2 ml-1 font-mono text-xs text-gray-500 bg-gray-200 rounded-xl leading-5">
      {toString(tag)}
    </div>
  )
}
