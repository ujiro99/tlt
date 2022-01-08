import React from 'react'
import { useRecoilValue } from 'recoil'

import { dragMotionState } from '@/services/state'
import { useDragMotion } from '@/hooks/useDragMotion'
import { TransProps } from 'popup'

export const MdHeading: React.FC<unknown> = (
  props: TransProps,
): JSX.Element => {
  const line = props.node.position.start.line
  const dragMotions = useRecoilValue(dragMotionState)
  const dragItem = dragMotions.find((n) => n.line === line)
  const motionStyles = useDragMotion(dragItem?.props)

  const TagName = props.node.tagName as keyof JSX.IntrinsicElements

  return (
    <TagName style={motionStyles} className={props.className}>
      {props.children}
    </TagName>
  )
}
