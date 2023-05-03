import React, { useState, useEffect } from 'react'

import { Time } from '@/models/time'
import { pad } from '@/services/util'

import '@/components/Counter.css'

type CounterProps = {
  startTime: Time
}

export function Counter(props: CounterProps): JSX.Element {
  const [count, setCount] = useState(props.startTime.toSeconds())

  useEffect(() => {
    const timerId = setInterval(() => {
      setCount((count) => count + 1)
    }, 1000)
    return () => clearInterval(timerId)
  }, [])

  const time = Time.parseSecond(count)
  return <CounterStopped startTime={time} />
}

export function CounterStopped(props: CounterProps): JSX.Element {
  const time = props.startTime
  return (
    <div className="counter">
      {time.days > 0 ? (
        <>
          <span className="counter__days">{time.days}</span>
          <span className="counter__unit">d</span>
        </>
      ) : (
        <></>
      )}
      {time.hours > 0 ? (
        <>
          <span className="counter__hours">{time.hours}</span>
          <span className="counter__unit">h</span>
        </>
      ) : (
        <></>
      )}
      <span className="counter__minutes">{pad(time.minutes, 2)}</span>
      <span className="counter__unit">m</span>
    </div>
  )
}
