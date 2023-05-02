import React, { useState } from 'react'
import { Item, useContextMenu } from '@/lib/react-contexify'
import { Icon } from '@/components/Icon'

type disabledFunc = () => boolean

type Props = {
  id?: string
  onClick: (param: any) => void
  className: string
  label: string
  labelConfirm: string
  iconName: string
  disabled?: boolean | disabledFunc
}

export const ItemConfirm: React.FC<Props> = (props: Props): JSX.Element => {
  const [confirm, setConfirm] = useState(false)
  const { hideAll } = useContextMenu()

  const clickItem = () => {
    setConfirm(true)
  }

  const clickOk = (e) => {
    props.onClick({ id: props.id, triggerEvent: e })
  }

  return confirm ? (
    <div className="contexify_itemContent">
      <div className={props.className}>
        <Icon className={props.className + '-icon'} name={props.iconName} />
        <span>{props.labelConfirm}</span>
        <button className="context-menu__confirm-button" onClick={clickOk}>
          <Icon className="context-menu__confirm-button-icon" name="check" />
        </button>
        <button className="context-menu__confirm-button" onClick={hideAll}>
          <Icon className="context-menu__confirm-button-icon" name="close" />
        </button>
      </div>
    </div>
  ) : (
    <Item onClick={clickItem} closeOnClick={false} disabled={props.disabled}>
      <div className={props.className}>
        <Icon className={props.className + '-icon'} name={props.iconName} />
        <span>{props.label}</span>
      </div>
    </Item>
  )
}
