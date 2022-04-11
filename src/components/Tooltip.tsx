import React, { CSSProperties } from 'react'
import classnames from 'classnames'
import { CSSTransition } from 'react-transition-group'

import '@/components/Tooltip.css'
import '@/css/fadeIn.css'

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
  style?: CSSProperties
  timeout?: number
  children?: React.ReactNode
}

export function Tooltip(props: TooltipProp): JSX.Element {
  const show = props.show
  const location = props.location
  const timeout = props.timeout || 200
  const className = classnames('tooltip__inner', `tooltip--${location}`)

  return (
    <CSSTransition in={show} timeout={timeout} classNames="fade" unmountOnExit>
      <div className="tooltip">
        <div className={className} style={props.style}>{props.children}</div>
      </div>
    </CSSTransition>
  )
}
