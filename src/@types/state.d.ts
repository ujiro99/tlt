import { Time } from '@/models/time'
import { Node } from '@/models/node'

type TrackingState = {
  line: number
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

interface ITaskListState {
  text: string
  lineCount: number,
  setText: (value: string) => void
  getTextByLine: (line: number) => string
  setTextByLine: (line: number, text: string) => void
  isTaskStrByLine: (line: number) => boolean
  moveLines: (index: number, insertPosition: number, count?: number, indent?: number) => void
  getNode: () => Node
  setNode: (node: Node) => void
}

interface ITaskState {
  stopAllTracking: () => void
}
