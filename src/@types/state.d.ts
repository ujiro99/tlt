import { Time } from '@/models/time'

type TrackingState = {
  nodeId: string
  isTracking: boolean
  trackingStartTime: number /** [milli second] */
  elapsedTime: Time
}

type TimeObject = {
  _seconds: number
  _minutes: number
  _hours: number
  _days: number
}
