import React from 'react'
import { useRecoilState } from 'recoil'
import { modeState, MODE } from './Menu'

import './IconButton.css'

export function Report(): JSX.Element {
  const [mode, setMode] = useRecoilState(modeState)
  const isReport = mode === MODE.REPORT
  const label = isReport ? 'Task' : 'Data'
  const icon = isReport ? 'icon-save' : 'icon-assessment'

  const toggleMode = () => {
    const nextMode = isReport ? MODE.SHOW : MODE.REPORT
    setMode(nextMode)
  }

  return (
    <button className="icon-button mode--report" onClick={toggleMode} >
      <svg className="icon-button__icon">
        <use xlinkHref={`/icons.svg#${icon}`} />
      </svg>
      <span className="icon-button__label">{label}</span>
    </button>
  )
}
