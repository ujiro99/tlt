import React from 'react'

type TaskControllerProps = {
  onClickStart: () => void
  onClickStop: () => void
  isTracking: boolean
}

export function TaskController(props: TaskControllerProps): JSX.Element {
  return (
    <div className="task-controll">
      {!props.isTracking ? (
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
      )}
    </div>
  )
}

