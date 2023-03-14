import React, { useState, useEffect, CSSProperties } from 'react'
import classnames from 'classnames'

import Log from '@/services/log'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useTrackingState, useTrackingStop } from '@/hooks/useTrackingState'
import { useEditable } from '@/hooks/useEditable'
import { Counter, CounterStopped } from '@/components/Counter'
import { Checkbox } from '@/components/Checkbox'
import { TaskController } from '@/components/TaskController'
import { TaskTags } from '@/components/Tag/TaskTags'
import { LineEditor } from '@/components/LineEditor'
import { Task } from '@/models/task'
import { Tag } from '@/models/tag'
import { Node } from '@/models/node'

import '@/components/TaskItem.css'

export type TaskCheckBox = {
  checked: boolean
  disabled: boolean
}

type TaskItemProps = {
  checkboxProps: TaskCheckBox
  node: Node
  style?: CSSProperties
}

export const TaskItem: React.FC<TaskItemProps> = (
  props: TaskItemProps,
): JSX.Element => {
  const checkboxProps = props.checkboxProps
  const node = props.node
  const line = props.node.line
  const [started, setStarted] = useState(false)
  const manager = useTaskManager()
  const analytics = useAnalytics()
  const { trackings, startTracking, stopTracking } = useTrackingState()
  const { stopOtherTracking } = useTrackingStop()
  const [isEditing, focusOrEdit] = useEditable(line)
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

    // If task has been tracking, stop automatically.
    stopTracking(node, checked)
  }

  const start = (e: React.SyntheticEvent) => {
    e.stopPropagation()
    analytics.track('click start')
    startTracking(node)
    setStarted(true)
  }

  const stop = (e: React.SyntheticEvent) => {
    e.stopPropagation()
    analytics.track('click stop')

    if (isTracking) {
      stopTracking(node)
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
    'task-item',
    {
      'task-item--running': isTracking,
      'task-item--complete': task.isComplete(),
    },
  )

  const style = {
    ...props.style,
  }

  if (isEditing) {
    return <LineEditor line={line} />
  }

  return (
    <div
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
        onClickStart={start}
        onClickStop={stop}
        isTracking={isTracking}
        isComplete={task.isComplete()}
        tags={task.tags}
        onChangeTags={onChangeTags}
      />
    </div>
  )
}
