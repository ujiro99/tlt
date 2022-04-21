import React, { useState } from 'react'
import { useRecoilValue } from 'recoil'

import { Tooltip } from '@/components/Tooltip'
import { modeState, MODE } from '@/components/Menu/Menu'
import { useTaskManager } from '@/hooks/useTaskManager'
import { sleep } from '@/services/util'
import { reportState } from '@/components/Report'

import './IconButton.css'

export function Copy(): JSX.Element {
  const manager = useTaskManager()
  const report = useRecoilValue(reportState)
  const mode = useRecoilValue(modeState)
  const [tooltipVisible, setTooltipVisible] = useState(false)

  const copy = async () => {
    let txt: string
    if (mode === MODE.SHOW) {
      txt = manager.getText()
    } else if (mode === MODE.REPORT) {
      txt = report
    }
    await navigator.clipboard.writeText(txt)
    await sleep(100)
    setTooltipVisible(true)
    await sleep(800)
    setTooltipVisible(false)
  }

  return (
    <button className="icon-button" onClick={copy}>
      <svg className="icon-button__icon">
        <use xlinkHref="/icons.svg#icon-copy" />
      </svg>
      <Tooltip show={tooltipVisible} location={'bottom'}>
        <span>Copied!</span>
      </Tooltip>
    </button>
  )
}
