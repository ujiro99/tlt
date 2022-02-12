import React from 'react'
import type { DragSource } from 'dnd'
import { DragIndicator } from '@/components/DragIndicator'
import '@/components/TaskController.css'

type TaskControllerProps = {
  isComplete: boolean
} & PlayStopProps

type PlayStopProps = {
  onClickStart: (e: React.MouseEvent<HTMLButtonElement>) => void
  onClickStop: (e: React.MouseEvent<HTMLButtonElement>) => void
  isTracking: boolean
}

function PlayStopButton(props: PlayStopProps) {
  return !props.isTracking ? (
    <button className="controll-button" onClick={props.onClickStart}>
      <svg className="icon">
        <use xlinkHref="/icons.svg#icon-play" />
      </svg>
    </button>
  ) : (
    <button className="controll-button" onClick={props.onClickStop}>
      <svg className="icon">
        <use xlinkHref="/icons.svg#icon-stop" />
      </svg>
    </button>
  )
}

export function TaskController(
  props: TaskControllerProps & DragSource,
): JSX.Element {
  // Stop event bubbling to avoid a parent element hide this component.
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="task-controll" onMouseDown={stopPropagation}>
      {!props.isComplete && <PlayStopButton {...props} />}
      <DragIndicator ref={props.drag} />
    </div>
  )
}
