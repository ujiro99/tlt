import React from 'react'
import classnames from 'classnames'

import { useEditable } from '@/hooks/useEditable'
import { LineEditor } from '@/components/LineEditor'
import { HeadingNode } from '@/models/node'
import Log from '@/services/log'

const baseClass =
  'w-full font-bold relative text-gray-700 leading-normal cursor-pointer px-3 group item-color'
const otherClass = {
  h1: 'text-base pt-4 pb-3',
  h2: 'text-base pt-4 pb-3',
  h3: 'text-sm pt-3 pb-2',
  h4: 'text-sm pt-3 pb-2',
  h5: 'text-sm pt-3 pb-2',
  h6: 'text-sm pt-3 pb-2',
}

type NodeProps = {
  node: HeadingNode
}

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export const MdHeading = (props: NodeProps): JSX.Element => {
  Log.v(props.node.data)
  const line = props.node.line

  const TagName = (
    props.node.level <= 6 ? `h${props.node.level}` : `h6`
  ) as HeadingTag

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
      <TagName>{props.node.data}</TagName>
    </div>
  )
}
