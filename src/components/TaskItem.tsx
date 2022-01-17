import React, { CSSProperties } from 'react'
import { useRecoilState } from 'recoil'
import classnames from 'classnames'

import { TaskTextState, TaskState, trackingStateList } from '@/services/state'
import Log from '@/services/log'
import { indentToMargin } from '@/services/util'
import { Task } from '@/models/task'
import { Counter, CounterStopped } from '@/components/Counter'
import { Checkbox } from '@/components/Checkbox'
import { TaskController } from '@/components/TaskController'

import { useEditable } from '@/hooks/useEditable'
import { LineEditor } from '@/components/LineEditor'

import type { DragSource, DragPreview } from 'dnd'

import '@/components/TaskItem.css'

export type TaskCheckBox = {
  type: string
  checked: boolean
  disabled: boolean
}

type TaskItemProps = {
  checkboxProps: TaskCheckBox
  line: number
  style?: CSSProperties
}

export const TaskItem: React.FC<TaskItemProps> = (
  props: TaskItemProps & DragSource & DragPreview
): JSX.Element => {
  const checkboxProps = props.checkboxProps
  const line = props.line
  const state = TaskTextState()
  const taskState = TaskState()
  const [trackings, setTrackings] = useRecoilState(trackingStateList)
  const [isEditing, focusOrEdit] = useEditable(line)
  const tracking = trackings.find((n) => n.line === line)
  const task = Task.parse(state.getTextByLine(line))
  const id = `check-${task.id}`

  const toggleItemCompletion = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTracking()) {
      // If task has been tracking, stop automatically.
      stopTracking(e)
    }

    const checked = e.target.checked
    Log.d(`checkbox clicked at ${line} to ${checked ? 'true' : 'false'}`)
    task.setComplete(checked)
    void state.setTextByLine(line, task.toString())
  }

  const startTracking = (e: React.MouseEvent<HTMLButtonElement>) => {
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

    e.stopPropagation()
  }

  const stopTracking = (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (isTracking()) {
      chrome.runtime.sendMessage({ command: 'stopTracking' })
      const newTrackings = trackings.filter((n) => n.line !== line)
      setTrackings(newTrackings)

      // update markdown text
      task.trackingStop(tracking.trackingStartTime)
      void state.setTextByLine(line, task.toString())
    }

    e.stopPropagation()
  }

  const onClick = () => {
    if (isTracking()) return
    focusOrEdit()
  }

  const isTracking = () => {
    if (tracking == null) return false
    return tracking.isTracking
  }

  Log.v(`${line} ${id} ${isTracking() ? 'tracking' : 'stop'}`)

  const taskItemClass = classnames({
    'task-item': true,
    'task-item--running': isTracking(),
  })

  const style = {
    marginLeft: indentToMargin(task.indent),
    ...props.style,
  }

  if (isEditing) {
    return <LineEditor line={line} />
  }

  return (
    <div
      tabIndex={0}
      className={taskItemClass}
      style={style}
      data-line={line}
      onClick={onClick}
      ref={props.preview}
    >
      <div className="task-item__label">
        <Checkbox
          id={id}
          checked={checkboxProps.checked}
          onChange={toggleItemCompletion}
        />
        <span className="flex-grow ml-2">{task.title}</span>
      </div>
      {isTracking() ? (
        <Counter startTime={tracking.elapsedTime} />
      ) : !task.actualTimes.isEmpty() ? (
        <CounterStopped startTime={task.actualTimes} />
      ) : (
        <div></div>
      )}
      <TaskController
        onClickStart={startTracking}
        onClickStop={stopTracking}
        isTracking={isTracking()}
        isComplete={task.isComplete()}
        drag={props.drag}
      />
    </div>
  )
}
