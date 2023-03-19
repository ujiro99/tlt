import React, { CSSProperties, useState } from 'react'
import { usePopper } from 'react-popper'
import { CSSTransition } from 'react-transition-group'

import '@/components/Tooltip.css'
import '@/css/fadeIn.css'

type Location =
  | 'auto'
  | 'auto-start'
  | 'auto-end'
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'left'
  | 'left-start'
  | 'left-end'

type TooltipProp = {
  show: boolean
  refElm: Element
  location: Location
  style?: CSSProperties
  timeout?: number
  children?: React.ReactNode
}

export function Tooltip(props: TooltipProp): JSX.Element {
  const [popperElement, setPopperElement] = useState(null)
  const [arrowElement, setArrowElement] = useState(null)
  const { styles, attributes } = usePopper(props.refElm, popperElement, {
    placement: props.location,
    modifiers: [
      { name: 'arrow', options: { element: arrowElement } },
      { name: 'offset', options: { offset: [0, 8] } },
    ],
  })

  const show = props.show
  const timeout = props.timeout || 200

  const style = {
    ...props.style,
  }

  return (
    <CSSTransition in={show} timeout={timeout} classNames="fade" unmountOnExit>
      <div
        className="tooltip"
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
      >
        <div
          className="tooltip__arrow"
          ref={setArrowElement}
          style={styles.arrow}
        />
        <div className="tooltip__inner" style={style}>
          {props.children}
        </div>
      </div>
    </CSSTransition>
  )
}
