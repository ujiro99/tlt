import React, { useState, useEffect } from 'react'
import classnames from 'classnames'

import { useMode, MODE } from '@/hooks/useMode'
import { useHover } from '@/hooks/useHover'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Tooltip } from '@/components/Tooltip'
import { Icon } from '@/components/Icon'
import { sleep } from '@/services/util'
import { GoogleCalendar } from '@/services/googleCalendar'
import * as i18n from '@/services/i18n'

import './IconButton.css'

export function Sync(): JSX.Element {
  const manager = useTaskManager()
  const analytics = useAnalytics()
  const [mode] = useMode()
  const [hoverRef, isHovered] = useHover(200)
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [labelVisible, setLabelVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState(0)
  const isVisible = mode === MODE.SHOW

  const importGoogle = async () => {
    analytics.track('click import google calendar')
    let events = await GoogleCalendar.getEvents()

    for (let e of events) {
      manager.appendText(e.md)
    }

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
      className={classnames('icon-button group mod--sync', {
        hidden: !isVisible,
      })}
      onClick={importGoogle}
      ref={hoverRef as React.RefObject<HTMLButtonElement>}
    >
      <Icon className="icon-button__icon" name="cloud" />
      <Tooltip
        show={tooltipVisible}
        location={'bottom'}
        style={{ whiteSpace: 'nowrap', left: '4px' }}
      >
        <span>{i18n.t('copied')}</span>
      </Tooltip>
      <Tooltip
        show={labelVisible}
        location={'bottom'}
        style={{ whiteSpace: 'nowrap', top: '14px' }}
      >
        <span>{i18n.t('label_google_calendar')}</span>
      </Tooltip>
    </button>
  )
}
