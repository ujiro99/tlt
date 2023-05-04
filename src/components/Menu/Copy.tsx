import React, { useState, useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import classnames from 'classnames'

import { useMode, MODE } from '@/hooks/useMode'
import { useHover } from '@/hooks/useHover'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useAnalytics } from '@/hooks/useAnalytics'
import { reportState } from '@/components/Report'
import { Tooltip } from '@/components/Tooltip'
import { Icon } from '@/components/Icon'
import { sleep } from '@/services/util'
import * as i18n from '@/services/i18n'

import './IconButton.css'

export function Copy(): JSX.Element {
  const manager = useTaskManager()
  const analytics = useAnalytics()
  const report = useRecoilValue(reportState)
  const [mode] = useMode()
  const [hoverRef, isHovered] = useHover(200)
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [labelVisible, setLabelVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState(0)

  const isVisible = mode === MODE.EDIT || mode === MODE.REPORT

  const copy = async () => {
    analytics.track('click copy')
    let txt: string
    if (mode === MODE.EDIT) {
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

  useEffect(() => {
    clearTimeout(timeoutId)
    if (isHovered) {
      setLabelVisible(true)
    } else {
      const id = window.setTimeout(() => {
        setLabelVisible(false)
      }, 50)
      setTimeoutId(id)
    }
  }, [isHovered])

  return (
    <button
      className={classnames('icon-button', {
        hidden: !isVisible,
      })}
      onClick={copy}
      ref={hoverRef as React.RefObject<HTMLButtonElement>}
    >
      <Icon className="icon-button__icon" name="copy" />
      <Tooltip
        show={tooltipVisible}
        location={'bottom'}
        style={{ whiteSpace: 'nowrap', left: '4px' }}
        refElm={hoverRef.current}
      >
        <span>{i18n.t('copied')}</span>
      </Tooltip>
      <Tooltip
        show={labelVisible}
        location={'bottom'}
        style={{ whiteSpace: 'nowrap', top: '14px' }}
        refElm={hoverRef.current}
      >
        <span>{i18n.t('label_copy')}</span>
      </Tooltip>
    </button>
  )
}
