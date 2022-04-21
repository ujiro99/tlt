import React from 'react'
import { useRecoilState } from 'recoil'
import classnames from 'classnames'

import { useTrackingState } from '@/hooks/useTrackingState'
import { modeState, MODE } from './Menu'

import './IconButton.css'

export function Edit(): JSX.Element {
  const { stopAllTracking } = useTrackingState()
  const [mode, setMode] = useRecoilState(modeState)
  const isEdit = mode === MODE.EDIT
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

  return (
    <button
      className={classnames('icon-button', isEdit ? 'mod--save' : 'mod--edit', {
        hidden: !isVisible,
      })}
      onClick={toggleMode}
    >
      <svg className="icon-button__icon">
        <use xlinkHref={`/icons.svg#${icon}`} />
      </svg>
    </button>
  )
}
