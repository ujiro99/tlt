import React, { forwardRef } from 'react'

export const DragIndicator = forwardRef<HTMLButtonElement>(
  function DragIndicatorInner(_, ref) {
    return (
      <button className="controll-dnd" ref={ref}>
        <svg className="icon">
          <use xlinkHref="/icons.svg#icon-drag-indicator" />
        </svg>
      </button>
    )
  },
)
