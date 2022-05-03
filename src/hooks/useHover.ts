import { useState, useEffect, useRef } from 'react'
import { eventStop } from '@/services/util'

type useHoverReturn = [
  hoverRef: React.Ref<HTMLElement>,
  isHovered: boolean,
  event: MouseEvent,
]

export function useHover(wait=0 /* ms */): useHoverReturn {
  const [hovered, setHovered] = useState(false)
  const [result, setResult] = useState(false)
  const [timeoutID, setTimeoutID] = useState<number>()
  const [event, setEvent] = useState<MouseEvent>()
  const ref = useRef<HTMLElement>(null)

  const handleMouseOver = (e: MouseEvent) => {
    if (timeoutID) clearTimeout(timeoutID)

    setEvent(e)
    setHovered(true)

    if (wait > 0) {
      const newTimeoutId = window.setTimeout(() => {
        setResult(true)
        setTimeoutID(null)
      }, wait)
      setTimeoutID(newTimeoutId)
    } else {
      setResult(true)
    }
  }

  const handleMouseOut = (e: MouseEvent) => {
    clearTimeout(timeoutID)
    setEvent(e)
    setHovered(false)
    setResult(false)
  }

  useEffect(() => {
    if(!hovered && timeoutID > 0) {
      clearTimeout(timeoutID)
      setTimeoutID(null)
    }
  }, [hovered, timeoutID])

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
  return [ref, result, event]
}

type useHoverCancelReturn = [hoverRef: React.Ref<HTMLElement>]

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
