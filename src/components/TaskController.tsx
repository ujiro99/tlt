import React, { useState } from 'react'
import classnames from 'classnames'
import { isToday } from 'date-fns'

import '@/components/TaskController.css'
import { useCalendarDate } from '@/hooks/useCalendarDate'
import { Tooltip } from '@/components/Tooltip'
import { sleep } from '@/services/util'

type TaskControllerProps = {
  isComplete: boolean
} & PlayStopProps

type PlayStopProps = {
  onClickStart: (e: React.MouseEvent<HTMLButtonElement>) => void
  onClickStop: (e: React.MouseEvent<HTMLButtonElement>) => void
  isTracking: boolean
}

function PlayStopButton(props: PlayStopProps) {
  const [date] = useCalendarDate()
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [timeoutID, setTimeoutID] = useState<number>()
  const available = isToday(date)
  const className = classnames('controll-button', {
    'mod-disable': !available,
  })

  const onClickStart = available ? props.onClickStart : null

  const tickTooltip = async () => {
    setTooltipVisible(true)
    await sleep(2000)
    setTooltipVisible(false)
  }

  const onMouseEnter = () => {
    if (available) return
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
    >
      <svg className="icon">
        <use xlinkHref="/icons.svg#icon-play" />
      </svg>
      <Tooltip
        show={tooltipVisible}
        location={'left'}
        style={{
          width: '10rem',
          top: '18px',
          transform: 'translate(-20px, -50%)',
        }}
      >
        <span>You can start today only.</span>
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
  // Stop event bubbling to avoid a parent element hide this component.
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    !props.isComplete && (
      <div className="task-controll" onMouseDown={stopPropagation}>
        <PlayStopButton {...props} />
      </div>
    )
  )
}
