import React, { useState, useEffect } from 'react'

import { Time } from '@/models/time'

import '@/components/counter.css'

type CounterProps = {
  id: number
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
  return <div className="counter">{time.toClockString()}</div>
}
