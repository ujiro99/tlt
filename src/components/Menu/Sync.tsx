import React from 'react'
import classnames from 'classnames'

import { useMode, MODE } from '@/hooks/useMode'
import { useHover } from '@/hooks/useHover'
import { useModal, MODAL } from '@/hooks/useModal'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Tooltip } from '@/components/Tooltip'
import { Icon } from '@/components/Icon'
import * as i18n from '@/services/i18n'

import './IconButton.css'

export function Sync(): JSX.Element {
  const analytics = useAnalytics()
  const [mode] = useMode()
  const [_, setVisible] = useModal(MODAL.SYNC)
  const [hoverRef, isHovered] = useHover(200)
  const isVisible = mode === MODE.SHOW

  const showModal = () => {
    setVisible(true)
    analytics.track('click sync modal')
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
