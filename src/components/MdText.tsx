import React from 'react'
import classnames from 'classnames'

import { useEditable } from '@/hooks/useEditable'
import { LineEditor } from '@/components/LineEditor'
import { Node } from '@/models/node'
// import Log from '@/services/log'

const baseClass =
  'relative leading-normal focus:bg-indigo-50 cursor-pointer px-3 py-2 min-h-[40px] group'

type Props = {
  node: Node
}

export const MdText = (props: Props): JSX.Element => {
  const line = props.node.line

  const MdTextInner: React.FC<Props> = (props: Props): JSX.Element => {
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

  return (
    <div className='w-full raw-text' >
      <MdTextInner node={props.node} />
    </div>
  )
}
