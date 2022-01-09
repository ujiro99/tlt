import React from 'react'

import { useDragMotion } from '@/hooks/useDragMotion'
import { TransProps } from 'popup'

export const MdHeading: React.FC<unknown> = (
  props: TransProps,
): JSX.Element => {
  const line = props.node.position.start.line
  const motionStyles = useDragMotion(line)

  const TagName = props.node.tagName as keyof JSX.IntrinsicElements

  return (
    <TagName style={motionStyles} className={props.className}>
      {props.children}
    </TagName>
  )
}
