import { useState, useEffect, useRef } from 'react'
import { eventStop } from '@/services/util'

type useHoverReturn = [
  hoverRef: React.Ref<HTMLElement>,
  isHovered: boolean,
  event: MouseEvent
]

export function useHover(): useHoverReturn {
  const [hovered, setHovered] = useState(false)
  const [event, setEvent] = useState<MouseEvent>()
  const ref = useRef<HTMLElement>(null)

  const handleMouseOver = (e: MouseEvent) => {
    setEvent(e)
    setHovered(true)
  }

  const handleMouseOut = (e: MouseEvent) => {
    setEvent(e)
    setHovered(false)
  }

  useEffect(
    () => {
      const node = ref.current
      if (node) {
        node.addEventListener('mouseover', handleMouseOver)
        node.addEventListener('mouseout', handleMouseOut)
        return () => {
          node.removeEventListener('mouseover', handleMouseOver)
          node.removeEventListener('mouseout', handleMouseOut)
        }
      }
    },
    [ref.current], // Recall only if ref changes
  )
  return [ref, hovered, event]
}

type useHoverCancelReturn = [
  hoverRef: React.Ref<HTMLElement>,
]

export function useHoverCancel(): useHoverCancelReturn {
  const ref = useRef<HTMLElement>(null)

  useEffect(
    () => {
      const node = ref.current
      if (node) {
        node.addEventListener('mouseover', eventStop)
        node.addEventListener('mouseout', eventStop)
        return () => {
          node.removeEventListener('mouseover', eventStop)
          node.removeEventListener('mouseout', eventStop)
        }
      }
    },
    [ref.current], // Recall only if ref changes
  )
  return [ref]
}
