import React from 'react'
import { Item, Menu, useContextMenu } from '@/lib/react-contexify'
import { Icon } from './Icon'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useEditable } from '@/hooks/useEditable'
import { useTrackingState } from '@/hooks/useTrackingState'
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
  onCollapse?(): void
}

export const MdWrapper: React.FC<Props> = (props: Props): JSX.Element => {
  const manager = useTaskManager()
  const [_, __, edit] = useEditable(props.line)
  const { trackings } = useTrackingState()
  const tracking = trackings.find((n) => n.line === props.line)
  const isTracking = tracking == null ? false : tracking.isTracking

  const MENU_ID = MENU_ID_PREFIX + props.line
  const { show } = useContextMenu({
    id: MENU_ID,
  })

  function openContextMenu(event) {
    show({ event })
  }

  const handleInsert = () => {
    manager.addEmptyNodeByLine(props.line)
    edit(props.line + 1)
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
        {props.onCollapse && (
          <button onClick={props.onCollapse} className="item-wrapper__collapse">
            {collapseIcon}
          </button>
        )}
        {props.children}
      </div>

      {/* context menu */}
      <Menu className="context-menu" id={MENU_ID} onPointerDown={eventStop}>
        <Item id="color" onClick={handleInsert}>
          <div className="context-menu__color">
            <Icon className="context-menu__color-icon" name="plus" />
            <span>{t('context_menu_add')}</span>
          </div>
        </Item>
        <ItemConfirm
          onClick={handleDelete}
          className="context-menu__delete"
          label={t('context_menu_delete')}
          labelConfirm={t('context_menu_delete_confirm')}
          iconName="delete"
          disabled={isTracking}
        />
      </Menu>
    </>
  )
}

const collapseIcon = (
  <svg width="10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 41">
    <path d="M30.76 39.2402C31.885 40.3638 33.41 40.995 35 40.995C36.59 40.995 38.115 40.3638 39.24 39.2402L68.24 10.2402C69.2998 9.10284 69.8768 7.59846 69.8494 6.04406C69.822 4.48965 69.1923 3.00657 68.093 1.90726C66.9937 0.807959 65.5106 0.178263 63.9562 0.150837C62.4018 0.123411 60.8974 0.700397 59.76 1.76024L35 26.5102L10.24 1.76024C9.10259 0.700397 7.59822 0.123411 6.04381 0.150837C4.4894 0.178263 3.00632 0.807959 1.90702 1.90726C0.807714 3.00657 0.178019 4.48965 0.150593 6.04406C0.123167 7.59846 0.700153 9.10284 1.75999 10.2402L30.76 39.2402Z" />
  </svg>
)
