import { useState, useEffect, useRef } from 'react'
import { eventStop } from '@/services/util'

type useHoverReturn = [
  hoverRef: React.RefObject<HTMLElement>,
  isHovered: boolean,
]

export function useHover(wait = 0 /* ms */): useHoverReturn {
  const [hovered, setHovered] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [timeoutID, setTimeoutID] = useState<number>()
  const hoverRef = useRef<HTMLElement>(null)

  const handleMouseEnter = (e: MouseEvent) => {
    if (timeoutID) clearTimeout(timeoutID)

    setHovered(true)

    if (wait > 0) {
      const newTimeoutId = window.setTimeout(() => {
        setIsHovered(true)
        setTimeoutID(null)
      }, wait)
      setTimeoutID(newTimeoutId)
    } else {
      setIsHovered(true)
    }
  }

  const handleMouseLeave = (e: MouseEvent) => {
    clearTimeout(timeoutID)
    setHovered(false)
    setIsHovered(false)
  }

  useEffect(() => {
    if (!hovered && timeoutID > 0) {
      clearTimeout(timeoutID)
      setTimeoutID(null)
    }
  }, [hovered, timeoutID])

  useEffect(() => {
    const node = hoverRef.current
    if (node) {
      node.addEventListener('mouseenter', handleMouseEnter)
      node.addEventListener('mouseleave', handleMouseLeave)
      return () => {
        node.removeEventListener('mouseenter', handleMouseEnter)
        node.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [hoverRef.current])
  return [hoverRef, isHovered]
}

type useHoverCancelReturn = [hoverRef: React.RefObject<HTMLElement>]

export function useHoverCancel(): useHoverCancelReturn {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const node = ref.current
    if (node) {
      node.addEventListener('mouseenter', eventStop)
      node.addEventListener('mouseleave', eventStop)
      return () => {
        node.removeEventListener('mouseenter', eventStop)
        node.removeEventListener('mouseleave', eventStop)
      }
    }
  }, [ref.current])
  return [ref]
}
