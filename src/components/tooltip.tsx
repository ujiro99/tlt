import React from 'react'
import classnames from 'classnames'
import { CSSTransition } from 'react-transition-group'

import '@/components/tooltip.css'
import '@/components/fadeIn.css'

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

  return (
    <CSSTransition in={show} timeout={200} classNames="fade" unmountOnExit>
      <div className="tooltip">
        <div className={className}>{props.children}</div>
      </div>
    </CSSTransition>
  )
}
