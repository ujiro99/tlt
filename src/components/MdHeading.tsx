import React from 'react'
import classnames from 'classnames'

import { useEditable } from '@/hooks/useEditable'
import { LineEditor } from '@/components/LineEditor'
import { TaskTag } from '@/components/TaskTag'
import { Node } from '@/models/node'
import { Group } from '@/models/group'
import Log from '@/services/log'

const baseClass =
  'w-full font-bold relative text-gray-700 leading-normal cursor-pointer px-3 group item-color flex items-center'
const otherClass = {
  h1: 'text-base pt-4 pb-3',
  h2: 'text-base pt-4 pb-3',
  h3: 'text-sm pt-3 pb-2',
  h4: 'text-sm pt-3 pb-2',
  h5: 'text-sm pt-3 pb-2',
  h6: 'text-sm pt-3 pb-2',
}

type NodeProps = {
  node: Node
}

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export const MdHeading = (props: NodeProps): JSX.Element => {
  Log.v(props.node.data)
  const line = props.node.line
  const group = props.node.data as Group
  const level = group.level
  const hasTags = group.tags.length > 0

  const TagName = (level <= 6 ? `h${level}` : `h6`) as HeadingTag

  const [isEditing, focusOrEdit] = useEditable(line)
  if (isEditing) {
    return (
      <LineEditor
        className={classnames(baseClass, otherClass[TagName])}
        line={line}
      />
    )
  }
  return (
    <div
      tabIndex={0}
      className={classnames(baseClass, otherClass[TagName])}
      onClick={focusOrEdit}
    >
      <TagName>{group.title}</TagName>

      {hasTags ? (
        <div className="ml-2 font-medium">
          {group.tags.map((tag) => (
            <TaskTag key={tag.name} tag={tag} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
