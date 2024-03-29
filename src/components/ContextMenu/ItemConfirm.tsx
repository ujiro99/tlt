import React, { useState, useEffect } from 'react'
import { Item, useContextMenu } from '@/lib/react-contexify'
import { Icon } from '@/components/Icon'

type disabledFunc = () => boolean

type Props = {
  id?: string
  className: string
  label: string
  labelConfirm: string
  iconName: string
  onClick: (param: any) => void
  onConfirming: (param: any) => void
  disabled?: boolean | disabledFunc
}

export const ItemConfirm: React.FC<Props> = (props: Props): JSX.Element => {
  const [confirm, setConfirm] = useState(false)
  const [event, setEvent] = useState()
  const { hideAll } = useContextMenu()

  useEffect(() => {
    if (confirm) {
      setTimeout(() => {
        props.onConfirming && props.onConfirming(event)
      }, 10)
    }
  }, [confirm])

  const clickItem = (e) => {
    setConfirm(true)
    setEvent(e)
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
          <Icon
            className="context-menu__confirm-button-icon context-menu__confirm-button-icon--ok"
            name="check"
          />
        </button>
        <button className="context-menu__confirm-button" onClick={hideAll}>
          <Icon
            className="context-menu__confirm-button-icon context-menu__confirm-button-icon--cancel"
            name="close"
          />
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
