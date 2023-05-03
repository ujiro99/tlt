import React, { useState, useEffect, useRef } from 'react'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useTrackingState } from '@/hooks/useTrackingState'
import { useMode, MODE } from '@/hooks/useMode'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Task } from '@/models/task'
import { Time } from '@/models/time'
import { pad, scrollTo } from '@/services/util'
import { t } from '@/services/i18n'

import './TrackingStatus.css'

const timeToStr = (time: Time): string => {
  return (
    pad(time.hours, 2) + ':' + pad(time.minutes, 2) + ':' + pad(time.seconds, 2)
  )
}

type RemainProps = {
  estimatedTime: Time
  elapsedTime: Time
}

function Remain(props: RemainProps): JSX.Element {
  const estimatedTime = props.estimatedTime
  const elapsedTime = props.elapsedTime
  const [time, setTime] = useState<Time>(new Time())
  const [displayStartTime] = useState(Date.now())

  useEffect(() => {
    update()
    const timerId = setInterval(update, 1000)
    return () => clearInterval(timerId)
  }, [estimatedTime, elapsedTime])

  const update = () => {
    const diff = Date.now() - displayStartTime
    const remain = Time.subs(estimatedTime, elapsedTime) * 1000 - diff
    setTime(Time.parseMs(remain))
  }

  return (
    <>
      <p className="tracking-status__type">
        <span>{time.isNegative() ? t('over') : t('remaining')}</span>
      </p>
      <p className="tracking-status__time">
        {time.isNegative() && (
          <span className="tracking-status__time-negative">-</span>
        )}
        <span>{timeToStr(time)}</span>
      </p>
    </>
  )
}

type ElapsedProps = {
  elapsedTime: Time
}

function Elapsed(props: ElapsedProps): JSX.Element {
  const elapsedTime = props.elapsedTime
  const [time, setTime] = useState<Time>(new Time())
  const [displayStartTime] = useState(Date.now())

  useEffect(() => {
    update()
    const timerId = setInterval(update, 1000)
    return () => clearInterval(timerId)
  }, [elapsedTime])

  const update = () => {
    const diff = Date.now() - displayStartTime
    const elapsed = elapsedTime.clone().add(Time.parseMs(diff))
    setTime(elapsed)
  }

  return (
    <>
      <p className="tracking-status__type">
        <span>{t('elapsed')}</span>
      </p>
      <p className="tracking-status__time">
        <span>{timeToStr(time)}</span>
      </p>
    </>
  )
}

function Title({ title }): JSX.Element {
  const [needMarquee, setNeedMarquee] = useState(false)
  const textRef = useRef<HTMLSpanElement>()
  const frameRef = useRef<HTMLParagraphElement>()

  useEffect(() => {
    const textWidth = textRef.current?.getBoundingClientRect()?.width
    const frameWidth = frameRef.current?.getBoundingClientRect()?.width
    let nm = textWidth > frameWidth
    setNeedMarquee(nm)
  }, [title])

  let className = 'tracking-status__task-name'
  if (needMarquee) {
    className += ' mod-marquee'
  }

  return (
    <p className={className} ref={frameRef}>
      <span ref={textRef}>{title}</span>
      {needMarquee && <span className="pseudo">{title}</span>}
    </p>
  )
}

export function TrackingStatus(): JSX.Element {
  const manager = useTaskManager()
  const analytics = useAnalytics()
  const [mode] = useMode()
  const { trackings } = useTrackingState()

  if (mode !== MODE.SHOW) {
    return null
  }

  const isTracking = trackings.length > 0
  if (!isTracking) {
    return <div className="tracking-status" />
  }

  const tracking = trackings[0]
  const node = manager.getRoot().find((n) => n.id === tracking.nodeId)
  if (node == null) {
    return <div className="tracking-status" />
  }

  const task = node.data as Task
  const hasEstimatedTime = !task.estimatedTimes.isEmpty()
  const estimatedTime = task.estimatedTimes
  const elapsedTime = tracking.elapsedTime

  const jumpToNode = () => {
    const elm = document.querySelector(`#node-${node.id}`)
    scrollTo(elm, 150)
    analytics.track('click jump_to_node')
  }

  return (
    <div className="tracking-status">
      {isTracking && (
        <button onClick={jumpToNode}>
          {hasEstimatedTime ? (
            <Remain estimatedTime={estimatedTime} elapsedTime={elapsedTime} />
          ) : (
            <Elapsed elapsedTime={elapsedTime} />
          )}
          <Title title={task.title} />
        </button>
      )}
    </div>
  )
}
