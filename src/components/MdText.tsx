import React from 'react'
import classnames from 'classnames'

import { LineEditor } from '@/components/LineEditor'
import { useEditable } from '@/hooks/useEditable'
import { Node } from '@/models/node'

type Props = {
  node: Node
}

const baseClass =
  'w-full raw-text relative leading-normal focus:bg-indigo-50 cursor-pointer px-3 py-2 min-h-[40px] group'

export const MdText = (props: Props): JSX.Element => {
  const line = props.node.line
  const [isEditing, focusOrEdit] = useEditable(line)

  if (isEditing) {
    return <LineEditor className={classnames(baseClass)} line={line} />
  }

  return (
    <div tabIndex={0} className={classnames(baseClass)} onClick={focusOrEdit}>
      <span>{props.node.data}</span>
    </div>
  )
}
