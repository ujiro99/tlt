import React, { useState } from 'react'
import classnames from 'classnames'
import { isToday } from 'date-fns'

import { useCalendarDate } from '@/hooks/useCalendarDate'
import { Tooltip } from '@/components/Tooltip'
import { TagMenu, TagMenuProps } from '@/components/Tag/TagMenu'
import { sleep, eventStop } from '@/services/util'
import * as i18n from '@/services/i18n'

import '@/components/TaskController.css'

type TaskControllerProps = {
  isComplete: boolean
} & PlayStopProps &
  TagMenuProps

type PlayStopProps = {
  onClickStart: (e: React.MouseEvent<HTMLButtonElement>) => void
  onClickStop: (e: React.MouseEvent<HTMLButtonElement>) => void
  isTracking: boolean
  available?: boolean
}

function PlayStopButton(props: PlayStopProps) {
  const { date } = useCalendarDate()
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [timeoutID, setTimeoutID] = useState<number>()
  const available = props.available && isToday(date)
  const className = classnames('controll-button', {
    'mod-disable': !available,
  })
  const [refElm, setRefElm] = useState(null)

  const onClickStart = available ? props.onClickStart : null

  const tickTooltip = async () => {
    setTooltipVisible(true)
    await sleep(2000)
    setTooltipVisible(false)
  }

  const onMouseEnter = () => {
    if (isToday(date)) return
    const id = window.setTimeout(() => {
      void tickTooltip()
    }, 400)
    setTimeoutID(id)
  }

  const onMouseLeave = () => {
    clearTimeout(timeoutID)
    setTooltipVisible(false)
  }

  return !props.isTracking ? (
    <button
      className={className}
      onClick={onClickStart}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={setRefElm}
    >
      <svg className="icon">
        <use xlinkHref="/icons.svg#icon-play" />
      </svg>
      <Tooltip
        show={tooltipVisible}
        location={'left'}
        style={{ width: '10rem' }}
        refElm={refElm}
      >
        <span>{i18n.t('start_only_today')}</span>
      </Tooltip>
    </button>
  ) : (
    <button className={className} onClick={props.onClickStop}>
      <svg className="icon">
        <use xlinkHref="/icons.svg#icon-stop" />
      </svg>
    </button>
  )
}

export function TaskController(props: TaskControllerProps): JSX.Element {
  const [menuOpen, setMenuOpened] = useState(false)

  const buttonProps = {
    ...props,
    available: !props.isComplete,
  }

  const className = classnames('task-controll', {
    'task-controll--visible': menuOpen,
  })

  return (
    <div className={className} onContextMenu={eventStop}>
      <TagMenu {...props} menuOpened={setMenuOpened} />
      <PlayStopButton {...buttonProps} />
    </div>
  )
}
