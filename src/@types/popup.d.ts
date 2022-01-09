import { ReactElement } from 'react'
import type { Position } from 'unist'

declare module 'popup' {
  type Node = {
    children: []
    position: Position
    properties: unknown
    tagName: string
    type: string
  }

  type TransProps = {
    children: ReactElement[]
    className: string
    node: Node
  }
}
