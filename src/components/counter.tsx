import React, { useState, useEffect } from 'react'

import { Time } from '@/models/time'

import '@/components/counter.css'

type CounterProps = {
  startTime: Time
}

/**
 * Return the number as a zero-padded string.
 */
function pad(num: number, len: number): string {
  return `${num}`.padStart(len, '0')
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
  if (time.days > 0) {
    return (
      <div className="counter">
        <span className="counter__days">{time.days}</span>
        <span className="counter__unit">d</span>
        <span className="counter__hours">{time.hours}</span>
        <span className="counter__unit">h</span>
        <span className="counter__minutes">{pad(time.minutes, 2)}</span>
        <span className="counter__unit">m</span>
      </div>
    )
  } else {
    return (
      <div className="counter">
        <span className="counter__hours">{time.hours}</span>
        <span className="counter__unit">h</span>
        <span className="counter__minutes">{pad(time.minutes, 2)}</span>
        <span className="counter__unit">m</span>
      </div>
    )
  }
}
