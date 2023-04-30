import React, { useEffect } from 'react'
import { usePopper } from 'react-popper'
import { useHover, useHoverCancel } from '@/hooks/useHover'
import { eventStop } from '@/services/util'
import { createPortal } from 'react-dom'

import './BasePicker.css'

export const EVENT_TYPE = {
  CLICK: 'CLICK',
  HOVER: 'HOVER',
} as const
export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE]

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

export type BasePickerProps = {
  refElm: Element
  onRequestClose: () => void
  eventType?: EventType
  children?: React.ReactNode
  location?: Location
}

function Portal({ children }) {
  return createPortal(children, document.getElementById('popup'))
}

export const BasePicker = (props: BasePickerProps): JSX.Element => {
  const eventType = props.eventType || EVENT_TYPE.CLICK
  const [boundaryRef, isBoundaryHovered] = useHover()
  const [overlayRef, isOverlayHovered] = useHover()
  const [contentRef] = useHoverCancel()
  
  const { styles, attributes } = usePopper(props.refElm, contentRef.current, {
    placement: props.location,
    modifiers: [
      { name: 'offset', options: { offset: [0, 8] } },
      {
        name: 'preventOverflow',
        options: { boundary: boundaryRef.current, padding: 30 },
      },
    ],
  })

  const onClickOverlay = (e: React.MouseEvent) => {
    if (eventType === EVENT_TYPE.CLICK) {
      props.onRequestClose()
      eventStop(e)
    }
  }

  useEffect(() => {
    if (isOverlayHovered && eventType === EVENT_TYPE.HOVER) {
      props.onRequestClose()
    }
  }, [isOverlayHovered])

  useEffect(() => {
    if (isBoundaryHovered && !isOverlayHovered) {
      props.onRequestClose()
    }
  }, [isBoundaryHovered, isOverlayHovered])

  return (
    <Portal>
      <div
        className="BasePicker__boundary"
        ref={boundaryRef as React.RefObject<HTMLDivElement>}
      >
        <div
          className="BasePicker__overlay"
          onClick={onClickOverlay}
          onDragStart={eventStop}
          onPointerDown={eventStop}
          ref={overlayRef as React.RefObject<HTMLDivElement>}
        >
          <div
            className="BasePicker__content"
            style={styles.popper}
            ref={contentRef as React.RefObject<HTMLDivElement>}
            onClick={eventStop}
            onContextMenu={eventStop}
            {...attributes.popper}
          >
            {props.children}
          </div>
        </div>
      </div>
    </Portal>
  )
}
