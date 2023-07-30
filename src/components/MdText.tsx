import React from 'react'

import { LineEditor } from '@/components/LineEditor'
import { useEditable } from '@/hooks/useEditable'
import { Node } from '@/models/node'

import '@/components/PlainText.css'

type Props = {
  node: Node
}

export const MdText = (props: Props): JSX.Element => {
  const line = props.node.line
  const [isEditing, focusOrEdit] = useEditable(line)

  if (isEditing) {
    return <LineEditor className={'plain-text mod-edit'} line={line} />
  }

  return (
    <div className={'plain-text'} onClick={focusOrEdit}>
      <span>{props.node.data as React.ReactNode}</span>
    </div>
  )
}
