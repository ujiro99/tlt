import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
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
  actualTimes: Time
  startTime: number
  estimatedTime: Time
}

function Remain(props: RemainProps): JSX.Element {
  const estimatedTime = props.estimatedTime
  const [time, setTime] = useState<Time>(new Time())

  useLayoutEffect(() => {
    update()
    const timerId = setInterval(update, 1000)
    return () => clearInterval(timerId)
  }, [])

  const update = () => {
    const elapsed = Time.elapsed(props.startTime)
    const elapsedTime = props.actualTimes.clone().add(elapsed)
    const remain = Time.subs(estimatedTime, elapsedTime)
    setTime(Time.parseSecond(remain))
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
  actualTimes: Time
  startTime: number
}

function Elapsed(props: ElapsedProps): JSX.Element {
  const [time, setTime] = useState<Time>(new Time())

  useLayoutEffect(() => {
    update()
    const timerId = setInterval(update, 1000)
    return () => clearInterval(timerId)
  }, [])

  const update = () => {
    const elapsed = Time.elapsed(props.startTime)
    setTime(props.actualTimes.clone().add(elapsed))
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
  const hasEstimatedTime = task.estimatedTimes && !task.estimatedTimes.isEmpty()
  const estimatedTime = task.estimatedTimes

  const jumpToNode = () => {
    const elm = document.querySelector(`#node-${node.id}`)
    scrollTo(elm, 240)
    analytics.track('click jump_to_node')
  }

  return (
    <div className="tracking-status">
      {isTracking && (
        <button onClick={jumpToNode}>
          {hasEstimatedTime ? (
            <Remain
              actualTimes={task.actualTimes}
              startTime={tracking.trackingStartTime}
              estimatedTime={estimatedTime}
            />
          ) : (
            <Elapsed
              actualTimes={task.actualTimes}
              startTime={tracking.trackingStartTime}
            />
          )}
          <Title title={task.title} />
        </button>
      )}
    </div>
  )
}
