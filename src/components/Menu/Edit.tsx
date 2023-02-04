import React, { useState } from 'react'
import classnames from 'classnames'

import { useTrackingStop } from '@/hooks/useTrackingState'
import { useMode, MODE } from '@/hooks/useMode'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Tooltip } from '@/components/Tooltip'
import { Icon } from '@/components/Icon'
import * as i18n from '@/services/i18n'

import './IconButton.css'

export function Edit(): JSX.Element {
  const { stopAllTracking } = useTrackingStop()
  const analytics = useAnalytics()
  const [labelVisible, setLabelVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState(0)
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

  const hover = (e: React.SyntheticEvent<HTMLButtonElement>) => {
    clearTimeout(timeoutId)
    if (e.type === 'mouseover') {
      const id = window.setTimeout(() => {
        setLabelVisible(true)
      }, 200)
      setTimeoutId(id)
    } else {
      const id = window.setTimeout(() => {
        setLabelVisible(false)
      }, 50)
      setTimeoutId(id)
    }
  }

  return (
    <button
      className={classnames('icon-button group', isEdit ? 'mod--save' : 'mod--edit', {
        hidden: !isVisible,
      })}
      onClick={toggleMode}
      onMouseOver={hover}
      onMouseLeave={hover}
    >
      <Icon className="icon-button__icon" name={icon} />
      <Tooltip
        show={labelVisible}
        location={'bottom'}
        style={{ width: '4em', left: '0.8em', top: '14px' }}
      >
        <span>{label}</span>
      </Tooltip>
    </button>
  )
}
