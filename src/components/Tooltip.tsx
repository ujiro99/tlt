import React, { CSSProperties, useRef, useState } from 'react'
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
  const [ bound, setBound ] = useState<DOMRect>()
  const ref = useRef<HTMLDivElement>()

  const onEnter = () => {
    const node = ref.current
    if (node) {
      const b = node.getBoundingClientRect()
      setBound(b)
    }
  }

  let size = { w: 0, h: 0 }
  let pos = { x: 0, y: 0 }
  if (bound) {
    size = { w: bound.width, h: bound.height }
    pos = { x: bound.left, y: bound.top }
  }

  let left = Math.min(pos.x, window.innerWidth - size.w - 5) - pos.x as number | string
  if (props.style.left) {
    left = props.style.left
  }

  const style = {
    ...props.style,
    left,
  }

  return (
    <CSSTransition in={show} timeout={timeout} onEnter={onEnter} classNames="fade" unmountOnExit>
      <div className="tooltip">
        <div className={className} style={style} ref={ref}>
          {props.children}
        </div>
      </div>
    </CSSTransition>
  )
}
