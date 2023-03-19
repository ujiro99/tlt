import React from 'react'
import classnames from 'classnames'

import { useTrackingStop } from '@/hooks/useTrackingState'
import { useMode, MODE } from '@/hooks/useMode'
import { useHover } from '@/hooks/useHover'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Tooltip } from '@/components/Tooltip'
import { Icon } from '@/components/Icon'
import * as i18n from '@/services/i18n'

import './IconButton.css'

export function Edit(): JSX.Element {
  const { stopAllTracking } = useTrackingStop()
  const analytics = useAnalytics()
  const [hoverRef, isHovered] = useHover(200)
  const [mode, setMode] = useMode()
  const isEdit = mode === MODE.EDIT
  const label = isEdit ? i18n.t('label_save') : i18n.t('label_edit')
  const icon = isEdit ? 'save' : 'edit'
  const isVisible = mode === MODE.SHOW || mode === MODE.EDIT

  const toggleMode = () => {
    const nextMode = isEdit ? MODE.SHOW : MODE.EDIT
    if (nextMode === MODE.EDIT) {
      // Automatically stop tracking before entering edit mode.
      stopAllTracking()
      analytics.track('edit all start')
    } else {
      analytics.track('edit all finish')
    }
    setMode(nextMode)
  }

  return (
    <button
      className={classnames(
        'icon-button group',
        isEdit ? 'mod--save' : 'mod--edit',
        {
          hidden: !isVisible,
        },
      )}
      onClick={toggleMode}
      ref={hoverRef as React.RefObject<HTMLButtonElement>}
    >
      <Icon className="icon-button__icon" name={icon} />
      <Tooltip
        show={isHovered}
        location={'bottom'}
        style={{ width: '4em', top: '14px' }}
        refElm={hoverRef.current}
      >
        <span>{label}</span>
      </Tooltip>
    </button>
  )
}
