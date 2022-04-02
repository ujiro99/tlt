import React, { CSSProperties } from 'react'
import classnames from 'classnames'

import Log from '@/services/log'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useTrackingState } from '@/hooks/useTrackingState'
import { Task } from '@/models/task'
import { Counter, CounterStopped } from '@/components/Counter'
import { Checkbox } from '@/components/Checkbox'
import { TaskController } from '@/components/TaskController'
import { LineEditor } from '@/components/LineEditor'
import { useEditable } from '@/hooks/useEditable'

import '@/components/TaskItem.css'

export type TaskCheckBox = {
  checked: boolean
  disabled: boolean
}

type TaskItemProps = {
  checkboxProps: TaskCheckBox
  line: number
  style?: CSSProperties
}

export const TaskItem: React.FC<TaskItemProps> = (
  props: TaskItemProps,
): JSX.Element => {
  const checkboxProps = props.checkboxProps
  const line = props.line
  const manager = useTaskManager()
  const { trackings, setTrackings, stopAllTracking } = useTrackingState()
  const [isEditing, focusOrEdit] = useEditable(line)
  const tracking = trackings.find((n) => n.line === line)
  const node = manager.getNodeByLine(line)
  const task = node.data as Task
  const id = `check-${task.id}`

  const toggleItemCompletion = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTracking()) {
      // If task has been tracking, stop automatically.
      stopTracking(e)
    }

    const checked = e.target.checked
    Log.d(`checkbox clicked at ${line} to ${checked ? 'true' : 'false'}`)
    task.setComplete(checked)
    manager.setNodeByLine(node, line)
  }

  const startTracking = (e: React.MouseEvent<HTMLButtonElement>) => {
    // stop previous task.
    stopAllTracking()

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
      param: task.actualTimes.toMinutes(),
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
      task.trackingStop(tracking.trackingStartTime)
      manager.setNodeByLine(node, line)
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

  const taskItemClass = classnames(
    {
      'task-item--running': isTracking(),
    },
    ['task-item', 'focus:bg-indigo-50'],
  )

  const style = {
    ...props.style,
  }

  if (isEditing) {
    return <LineEditor className="indent-[10px]" line={line} />
  }

  return (
    <div
      tabIndex={0}
      className={taskItemClass}
      style={style}
      data-line={line}
      onClick={onClick}
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
      />
    </div>
  )
}
