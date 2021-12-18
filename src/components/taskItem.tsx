import React from 'react'
import { useRecoilState } from 'recoil'
import classnames from 'classnames'

import { TaskTextState, TaskState, trackingStateList } from '@/services/state'
import Log from '@/services/log'

import { Task } from '@/models/task'

import { Counter, CounterStopped } from '@/components/counter'
import { Checkbox } from '@/components/checkbox'
import { TaskController } from '@/components/taskController'

export type TaskCheckBox = {
  type: string
  checked: boolean
  disabled: boolean
}

type TaskItemProps = {
  checkboxProps: TaskCheckBox
  line: number
}

export function TaskItem(props: TaskItemProps): JSX.Element {
  const checkboxProps = props.checkboxProps
  const line = props.line
  const state = TaskTextState()
  const taskState = TaskState()
  const [trackings, setTrackings] = useRecoilState(trackingStateList)
  const tracking = trackings.find((n) => n.line === line)
  const task = Task.parse(state.getTextByLine(line))
  const id = `check-${task.id}`

  const toggleItemCompletion = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTracking()) {
      // If task has been tracking, stop automatically.
      stopTracking()
    }

    const checked = e.target.checked
    Log.d(`checkbox clicked at ${line} to ${checked ? 'true' : 'false'}`)
    task.setComplete(checked)
    void state.setTextByLine(line, task.toString())
  }

  const startTracking = () => {
    // stop previous task.
    taskState.stopAllTracking()

    // start new task.
    const trackingStartTime = task.trackingStart()
    const newTracking = {
      line: line,
      isTracking: true,
      trackingStartTime: trackingStartTime,
      elapsedTime: task.actualTimes,
    }
    setTrackings([newTracking])
    chrome.runtime.sendMessage({
      command: 'startTracking',
      param: task.actualTimes.minutes,
    })
  }

  const stopTracking = () => {
    if (isTracking()) {
      chrome.runtime.sendMessage({ command: 'stopTracking' })
      const newTrackings = trackings.filter((n) => n.line !== line)
      setTrackings(newTrackings)

      // update markdown text
      task.trackingStop(tracking.trackingStartTime)
      void state.setTextByLine(line, task.toString())
    }
  }

  const isTracking = () => {
    if (tracking == null) return false
    return tracking.isTracking
  }

  const taskItemClass = classnames({
    'task-item': true,
    'task-item--running': isTracking(),
  })

  const style = {
    marginLeft: `${task.indent / 4}em`,
  }

  // Log.d(`${id} ${isTracking() ? 'tracking' : 'stop'}`)

  return (
    <div className={taskItemClass} style={style}>
      <Checkbox
        id={id}
        checked={checkboxProps.checked}
        onChange={toggleItemCompletion}
      />
      <span className="flex-grow ml-2">{task.title}</span>
      {isTracking() ? (
        <Counter startTime={tracking.elapsedTime} />
      ) : !task.actualTimes.isEmpty() ? (
        <CounterStopped startTime={task.actualTimes} />
      ) : (
        <div></div>
      )}
      {!task.isComplete() && (
        <TaskController
          onClickStart={startTracking}
          onClickStop={stopTracking}
          isTracking={isTracking()}
        />
      )}
    </div>
  )
}
