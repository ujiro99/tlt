export type TrackingState = {
  key: string
  nodeId: string
  isTracking: boolean
  trackingStartTime: number /** [milli second] */
  line: number
}

export type TimeObject = {
  _seconds: number
  _minutes: number
  _hours: number
  _days: number
}

export interface IClonable<T> {
  clone(): T
}
