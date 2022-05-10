import React, { useState } from 'react'
import { useRecoilValue } from 'recoil'

import { Tooltip } from '@/components/Tooltip'
import { useMode, MODE } from '@/hooks/useMode'
import { Icon } from '@/components/Icon'
import { useTaskManager } from '@/hooks/useTaskManager'
import { sleep } from '@/services/util'
import { reportState } from '@/components/Report'
import * as i18n from '@/services/i18n'

import './IconButton.css'

export function Copy(): JSX.Element {
  const manager = useTaskManager()
  const report = useRecoilValue(reportState)
  const [mode] = useMode()
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [labelVisible, setLabelVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState(0)

  const copy = async () => {
    let txt: string
    if (mode === MODE.SHOW) {
      txt = manager.getText()
    } else if (mode === MODE.REPORT) {
      txt = report
    }
    await navigator.clipboard.writeText(txt)
    setLabelVisible(false)
    await sleep(100)
    setTooltipVisible(true)
    await sleep(800)
    setTooltipVisible(false)
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
      className="icon-button group"
      onClick={copy}
      onMouseOver={hover}
      onMouseLeave={hover}
    >
      <Icon className="icon-button__icon" name="copy" />
      <Tooltip
        show={tooltipVisible}
        location={'bottom'}
        style={{ left: '4px' }}
      >
        <span>{i18n.t('copied')}</span>
      </Tooltip>
      <Tooltip
        show={labelVisible}
        location={'top'}
        style={{ width: '6em', left: '-2px', bottom: '24px' }}
      >
        <span>{i18n.t('label_copy')}</span>
      </Tooltip>
    </button>
  )
}
