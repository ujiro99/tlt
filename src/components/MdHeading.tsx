import React from 'react'
import classnames from 'classnames'

import { useDragMotion } from '@/hooks/useDragMotion'
import { TransProps } from 'popup'

import { useEditable } from '@/hooks/useEditable'
import { LineEditor } from '@/components/LineEditor'

const baseClass =
  'font-bold relative text-gray-700 leading-normal focus:bg-indigo-50 cursor-pointer'
const otherClass = {
  h1: 'text-base pt-4 pb-3',
  h2: 'text-base pt-4 pb-3',
  h3: 'text-sm pt-3 pb-2',
  h4: 'text-sm pt-3 pb-2',
}

export const MdHeading: React.FC<unknown> = (
  props: TransProps,
): JSX.Element => {
  const line = props.node.position.start.line
  const motionStyles = useDragMotion(line)
  const [isEditing, focusOrEdit] = useEditable(line)

  const TagName = props.node.tagName as keyof JSX.IntrinsicElements
  const classNames = classnames(props.className, baseClass, otherClass[TagName])

  if (isEditing) {
    const classNames = classnames(baseClass, otherClass[TagName])
    return <LineEditor className={classNames} line={line} />
  }
  return (
    <TagName
      tabIndex={0}
      style={motionStyles}
      className={classNames}
      onClick={focusOrEdit}
    >
      {props.children}
    </TagName>
  )
}
