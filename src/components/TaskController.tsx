import React from 'react'
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

export function TaskController(props: TaskControllerProps): JSX.Element {
  // Stop event bubbling to avoid a parent element hide this component.
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    !props.isComplete && (
      <div className="task-controll" onMouseDown={stopPropagation}>
        <PlayStopButton {...props} />
      </div>
    )
  )
}
