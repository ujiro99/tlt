import React from 'react'
import { Menu, useContextMenu } from '@/lib/react-contexify'
import { Icon } from './Icon'
import { useTaskManager } from '@/hooks/useTaskManager'
import { eventStop } from '@/services/util'
import { ItemConfirm } from '@/components/ContextMenu/ItemConfirm'
import { t } from '@/services/i18n'
import 'react-contexify/ReactContexify.css'
import './MdWrapper.css'
import './ContextMenu.css'

const MENU_ID_PREFIX = 'md-wraper-menu-'

type Props = {
  children: React.ReactNode
  line: number
}

export const MdWrapper: React.FC<Props> = (props: Props): JSX.Element => {
  const manager = useTaskManager()
  const MENU_ID = MENU_ID_PREFIX + props.line
  const { show } = useContextMenu({
    id: MENU_ID,
  })

  function openContextMenu(event) {
    show({ event })
  }

  const handleDelete = () => {
    manager.removeLine(props.line)
  }

  return (
    <>
      <div
        tabIndex={0}
        className="item-wrapper"
        onContextMenu={openContextMenu}
      >
        <Icon className="item-wrapper__drag" name="drag" />
        {props.children}
      </div>

      {/* context menu */}
      <Menu className="context-menu" id={MENU_ID} onPointerDown={eventStop}>
        <ItemConfirm
          onClick={handleDelete}
          className="context-menu__delete"
          label={t('context_menu_delete')}
          labelConfirm={t('context_menu_delete_confirm')}
          iconName="delete"
        />
      </Menu>
    </>
  )
}
