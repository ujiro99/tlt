import React, { useState } from 'react'

import { Tooltip } from '@/components/Tooltip'
import { useTaskManager } from '@/hooks/useTaskManager'
import { sleep } from '@/services/util'

import './IconButton.css'

export function Copy(): JSX.Element {
  const manager = useTaskManager()
  const [tooltipVisible, setTooltipVisible] = useState(false)

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(manager.getText())
    await sleep(100)
    setTooltipVisible(true)
    await sleep(800)
    setTooltipVisible(false)
  }

  return (
    <button className="icon-button" onClick={copyMarkdown} >
      <svg className="icon-button__icon">
        <use xlinkHref="/icons.svg#icon-copy" />
      </svg>
      <span className="icon-button__label">Copy</span>
      <Tooltip show={tooltipVisible} location={'bottom'}>
        <span>Copied!</span>
      </Tooltip>
    </button>
  )
}
