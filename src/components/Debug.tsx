import React from 'react'
import { useTrackingState } from '@/hooks/useTrackingState'
import { TrackingState } from '@/@types/global'
import { formatTime } from '@/services/util'
import { isDebug } from '@/const'

const trackingsToText = (trackings: TrackingState[]) => {
  let res = '<trackings>'
  trackings.forEach((tracking) => {
    res += '\n  line: ' + tracking.line
    res += '\n  nodeId: ' + tracking.nodeId
    res += '\n  startTime: ' + formatTime(tracking.trackingStartTime)
    res += '\n  elapsedTime: ' + tracking.elapsedTime.toString()
  })
  res += '\n'
  return res
}

export function Debug(): JSX.Element {
  const { trackings } = useTrackingState()

  if (!isDebug) {
    return <></>
  }

  return (
    <pre className="debug">
      <code>{trackingsToText(trackings)}</code>
    </pre>
  )
}
