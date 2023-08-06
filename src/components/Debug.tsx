import React from 'react'
import { useTrackingState } from '@/hooks/useTrackingState'
import { useStorage } from '@/hooks/useStorage'
import { TrackingState } from '@/@types/global'
import { formatTime } from '@/services/util'
import { STORAGE_KEY } from '@/services/storage'
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
  const [sTrackings] = useStorage(STORAGE_KEY.TRACKING_STATE)
  const [sCalendar] = useStorage(STORAGE_KEY.CALENDAR_EVENT)
  const [sAlarms] = useStorage(STORAGE_KEY.ALARMS)

  if (!isDebug) {
    return <></>
  }

  return (
    <>
      <pre className="debug">
        <code>{trackingsToText(trackings)}</code>
      </pre>
      <pre className="debug">
        <code>trackings:</code><br />
        <code>{JSON.stringify(sTrackings, null, 2)}</code>
      </pre>
      <pre className="debug"><br />
        <code>calendar:</code>
        <code>{JSON.stringify(sCalendar, null, 2)}</code>
      </pre>
      <pre className="debug">
        <code>alarms</code> <br />
        <code>{JSON.stringify(sAlarms, null, 2)}</code>
      </pre>
    </>
  )
}
