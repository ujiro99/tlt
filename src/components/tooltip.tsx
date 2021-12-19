import React from 'react'
import classnames from 'classnames'

import '@/components/tooltip.css'

const TOOLTIP_POSITION = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
} as const
type TooltipPosition = typeof TOOLTIP_POSITION[keyof typeof TOOLTIP_POSITION]

type TooltipProp = {
  show: boolean
  location: TooltipPosition
  children?: React.ReactNode
}

export function Tooltip(props: TooltipProp): JSX.Element {
  const show = props.show
  const location = props.location
  const className = classnames('tooltip__inner', `tooltip--${location}`)

  if (show) {
    return (
      <div className="tooltip">
        <div className={className}>{props.children}</div>
      </div>
    )
  } else {
    return <></>
  }
}
