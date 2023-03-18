import React from 'react'
import { Icon } from './Icon'

import './MdWrapper.css'

type Props = {
  children: React.ReactNode
}

export const MdWrapper: React.FC<Props> = (props: Props): JSX.Element => {
  return (
    <div tabIndex={0} className="item-wrapper">
      <Icon className="item-wrapper__drag" name="drag" />
      {props.children}
    </div>
  )
}
