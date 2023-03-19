import React from 'react'
import classnames from 'classnames'

import { useMode, MODE } from '@/hooks/useMode'
import { useHover } from '@/hooks/useHover'
import { useSyncModal } from '@/hooks/useSyncModal'
import { Tooltip } from '@/components/Tooltip'
import { Icon } from '@/components/Icon'
import * as i18n from '@/services/i18n'

import './IconButton.css'

export function Sync(): JSX.Element {
  const [mode] = useMode()
  const [_, setVisible] = useSyncModal()
  const [hoverRef, isHovered] = useHover(200)
  const isVisible = mode === MODE.SHOW

  const showModal = () => {
    setVisible(true)
  }

  return (
    <button
      className={classnames('icon-button group mod--sync', {
        hidden: !isVisible,
      })}
      onClick={showModal}
      ref={hoverRef as React.RefObject<HTMLButtonElement>}
    >
      <Icon className="icon-button__icon" name="cloud" />
      <Tooltip
        show={isHovered}
        location={'bottom'}
        style={{ whiteSpace: 'nowrap', top: '14px' }}
        refElm={hoverRef.current}
      >
        <span>{i18n.t('label_google_calendar')}</span>
      </Tooltip>
    </button>
  )
}
