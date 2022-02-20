import React from 'react'
import classnames from 'classnames'

import { useDragMotion } from '@/hooks/useDragMotion'
import { useEditable } from '@/hooks/useEditable'
import { LineEditor } from '@/components/LineEditor'
import { TaskContainer } from '@/components/TaskContainer'
import { DraggableListItem } from '@/components/DraggableListItem'
import { DragIndicator } from '@/components/DragIndicator'
import { HeadingNode } from '@/models/node'
import Log from '@/services/log'

import type { DragSource } from 'dnd'

const baseClass =
  'font-bold relative text-gray-700 leading-normal focus:bg-indigo-50 cursor-pointer px-3'
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

type Props = {
  heading: HeadingTag
  text: string
}

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export const MdHeading = (props: NodeProps): JSX.Element => {
  Log.v(props.node.data)
  const line = props.node.line
  const hasChildren = props.node.children.length > 0
  const motionStyles = useDragMotion(line)

  const tagName = (
    props.node.level <= 6 ? `h${props.node.level}` : `h6`
  ) as HeadingTag
  const classNames = classnames(
    'group',
    'focus:bg-indigo-50',
    baseClass,
    otherClass[tagName],
  )

  const Heading: React.FC<Props> = (props: Props & DragSource): JSX.Element => {
    const TagName = props.heading
    const [isEditing, focusOrEdit] = useEditable(line)
    if (isEditing) {
      return (
        <LineEditor
          className={classnames(baseClass, otherClass[tagName])}
          line={line}
        />
      )
    }
    return (
      <div
        tabIndex={0}
        className={classNames}
        onClick={focusOrEdit}
        style={motionStyles}
      >
        <TagName>{props.text}</TagName>
        <div className="absolute top-0 right-0 flex items-center invisible h-full pr-4 group-hover:visible">
          <DragIndicator ref={props.drag} />
        </div>
      </div>
    )
  }

  return (
    <DraggableListItem
      className={'heading'}
      line={line}
      isHeading={true}
      hasChildren={true}
    >
      <Heading heading={tagName} text={props.node.data} />
      {hasChildren ? <TaskContainer nodes={props.node.children} /> : null}
    </DraggableListItem>
  )
}
