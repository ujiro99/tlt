import React, { useState } from 'react'
import { Item, useContextMenu } from '@/lib/react-contexify'
import { Icon } from '@/components/Icon'
import { t } from '@/services/i18n'

type Props = {
  onClick: (param: any) => void
}

export const ItemDelete: React.FC<Props> = (props: Props): JSX.Element => {
  const [confirm, setConfirm] = useState(false)
  const { hideAll } = useContextMenu()

  const clickItem = () => {
    setConfirm(true)
  }

  return confirm ? (
    <div className="contexify_itemContent">
      <div className="context-menu__delete">
        <Icon className="context-menu__delete-icon" name="delete" />
        <span>{t('context_menu_delete_confirm')}</span>
        <button
          className="context-menu__confirm-button"
          onClick={props.onClick}
        >
          <Icon className="context-menu__confirm-button-icon" name="check" />
        </button>
        <button className="context-menu__confirm-button" onClick={hideAll}>
          <Icon className="context-menu__confirm-button-icon" name="close" />
        </button>
      </div>
    </div>
  ) : (
    <Item id="delete" onClick={clickItem} closeOnClick={false}>
      <div className="context-menu__delete">
        <Icon className="context-menu__delete-icon" name="delete" />
        <span>{t('context_menu_delete')}</span>
      </div>
    </Item>
  )
}
