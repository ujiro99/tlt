import React, { useState } from 'react'
import { useRecoilState } from 'recoil'
import classnames from 'classnames'

import { useTrackingState } from '@/hooks/useTrackingState'
import { modeState, MODE } from './Menu'
import { Tooltip } from '@/components/Tooltip'

import './IconButton.css'

export function Edit(): JSX.Element {
  const { stopAllTracking } = useTrackingState()
  const [labelVisible, setLabelVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState(0)
  const [mode, setMode] = useRecoilState(modeState)
  const isEdit = mode === MODE.EDIT
  const label = isEdit ? 'Save' : 'Edit'
  const icon = isEdit ? 'icon-save' : 'icon-edit'
  const isVisible = mode === MODE.SHOW || mode === MODE.EDIT

  const toggleMode = () => {
    const nextMode = isEdit ? MODE.SHOW : MODE.EDIT
    if (nextMode === MODE.EDIT) {
      // Automatically stop tracking before entering edit mode.
      stopAllTracking()
    }
    setMode(nextMode)
  }

  const hover = (e: React.SyntheticEvent<HTMLButtonElement>) => {
    clearTimeout(timeoutId)
    if (e.type === 'mouseover') {
      const id = window.setTimeout(() => {
        setLabelVisible(true)
      }, 100)
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
      className={classnames('icon-button', isEdit ? 'mod--save' : 'mod--edit', {
        hidden: !isVisible,
      })}
      onClick={toggleMode}
      onMouseOver={hover}
      onMouseLeave={hover}
    >
      <svg className="icon-button__icon">
        <use xlinkHref={`/icons.svg#${icon}`} />
      </svg>
      <Tooltip
        show={labelVisible}
        location={'top'}
        style={{ width: '4em', left: '0.6em', bottom: '24px' }}
      >
        <span>{label}</span>
      </Tooltip>
    </button>
  )
}
