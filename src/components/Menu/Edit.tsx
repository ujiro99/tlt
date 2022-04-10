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
  const label = isEdit ? 'Save' : 'Edit'
  const icon = isEdit ? 'icon-save' : 'icon-edit'

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
      className={classnames('icon-button', isEdit ? 'mod--save' : 'mod--edit')}
      onClick={toggleMode}
    >
      <svg className="icon-button__icon">
        <use xlinkHref={`/icons.svg#${icon}`} />
      </svg>
      <span className="icon-button__label">{label}</span>
    </button>
  )
}
