import React from 'react'
import classnames from 'classnames'

import { useDragMotion } from '@/hooks/useDragMotion'
import { useEditable } from '@/hooks/useEditable'
import { LineEditor } from '@/components/LineEditor'
import { DraggableListItem } from '@/components/DraggableListItem'
import { DragIndicator } from '@/components/DragIndicator'
import { Node } from '@/models/node'
// import Log from '@/services/log'

import type { DragSource } from 'dnd'

const baseClass =
  'relative leading-normal focus:bg-indigo-50 cursor-pointer px-3 py-2 min-h-[40px] group'

type Props = {
  node: Node
}

export const MdText = (props: Props): JSX.Element => {
  const line = props.node.line
  const motionStyles = useDragMotion(line)

  const MdTextInner: React.FC<Props> = (
    props: Props & DragSource,
  ): JSX.Element => {
    const [isEditing, focusOrEdit] = useEditable(line)
    if (isEditing) {
      return <LineEditor className={classnames(baseClass)} line={line} />
    }
    return (
      <div
        tabIndex={0}
        className={classnames(baseClass)}
        onClick={focusOrEdit}
        style={motionStyles}
      >
        <span>{props.node.data}</span>
        <div className="absolute top-0 right-0 flex items-center invisible h-full pr-4 group-hover:visible">
          <DragIndicator ref={props.drag} />
        </div>
      </div>
    )
  }

  return (
    <DraggableListItem className={'raw-text'} line={line} hasChildren={false}>
      <MdTextInner node={props.node} />
    </DraggableListItem>
  )
}
