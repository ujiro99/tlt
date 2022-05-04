import React, { useState, useEffect, CSSProperties } from 'react'
import classnames from 'classnames'

import Log from '@/services/log'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useTrackingState } from '@/hooks/useTrackingState'
import { useEditable } from '@/hooks/useEditable'
import { Counter, CounterStopped } from '@/components/Counter'
import { Checkbox } from '@/components/Checkbox'
import { TaskController } from '@/components/TaskController'
import { TaskTags } from '@/components/TaskTags'
import { LineEditor } from '@/components/LineEditor'
import { Task } from '@/models/task'
import { Tag } from '@/models/tag'

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
  const [started, setStarted] = useState(false)
  const manager = useTaskManager()
  const { trackings, addTracking, removeTracking, stopOtherTracking } =
    useTrackingState()
  const [isEditing, focusOrEdit] = useEditable(line)
  const node = manager.getNodeByLine(line)
  const task = node.data as Task
  const tracking = trackings.find((n) => n.nodeId === node.id)
  const isTracking = tracking == null ? false : tracking.isTracking
  const id = `check-${task.id}`
  const hasEstimatedTime = !task.estimatedTimes.isEmpty()

  Log.v(`${line} ${id} ${isTracking ? 'tracking' : 'stop'}`)

  useEffect(() => {
    if (started) {
      // stop previous task.
      stopOtherTracking(node.id)
      setStarted(false)
    }
  }, [started, node])

  const toggleItemCompletion = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()

    const checked = e.target.checked
    Log.d(`checkbox clicked at ${line} to ${checked ? 'true' : 'false'}`)

    const newNode = node.clone()
    const newTask = newNode.data as Task

    if (isTracking) {
      // If task has been tracking, stop automatically.
      removeTracking(node.id)
      newTask.trackingStop(tracking.trackingStartTime)
    }
    newTask.setComplete(checked)

    manager.setNodeByLine(newNode, line)
  }

  const startTracking = (e: React.SyntheticEvent) => {
    e.stopPropagation()

    // Clone the objects for updating.
    const newNode = node.clone()
    const newTask = newNode.data as Task

    // start new task.
    const trackingStartTime = newTask.trackingStart()
    const newTracking = {
      nodeId: node.id,
      isTracking: true,
      trackingStartTime: trackingStartTime,
      elapsedTime: newTask.actualTimes,
      line,
    }
    addTracking(newTracking)

    setStarted(true)
    manager.setNodeByLine(newNode, line)
  }

  const stopTracking = (e: React.SyntheticEvent) => {
    e.stopPropagation()

    if (isTracking) {
      removeTracking(node.id)

      // Clone the objects for updating.
      const newNode = node.clone()
      const newTask = newNode.data as Task
      newTask.trackingStop(tracking.trackingStartTime)
      manager.setNodeByLine(newNode, line)
    }
  }

  const onClick = () => {
    if (isTracking) return
    focusOrEdit()
  }

  const onChangeTags = (tags: Tag[]) => {
    const newNode = node.clone()
    const newTask = newNode.data as Task
    newTask.tags = tags
    manager.setNodeByLine(newNode, line)
  }

  const taskItemClass = classnames(
    {
      'task-item--running': isTracking,
    },
    ['task-item', 'item-color'],
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
      <Checkbox
        id={id}
        checked={checkboxProps.checked}
        onChange={toggleItemCompletion}
      />
      <div className="task-item__label">
        <span className="ml-2">{task.title}</span>
      </div>
      <div className="task-item__tags">
        <TaskTags tags={task.tags} />
      </div>
      <div className="task-item__times">
        {isTracking ? (
          <Counter startTime={tracking.elapsedTime} />
        ) : !task.actualTimes.isEmpty() ? (
          <CounterStopped startTime={task.actualTimes} />
        ) : null}
        {hasEstimatedTime ? (
          <p className="font-mono text-xs task-item__estimated-time">
            {!isTracking && task.actualTimes.isEmpty() ? <span>-</span> : null}
            <span className="mx-1">/</span>
            <span>{task.estimatedTimes.toString()}</span>
          </p>
        ) : null}
      </div>
      <TaskController
        onClickStart={startTracking}
        onClickStop={stopTracking}
        isTracking={isTracking}
        isComplete={task.isComplete()}
        tags={task.tags}
        onChangeTags={onChangeTags}
      />
    </div>
  )
}
