import { ConnectDragSource, ConnectDragPreview } from 'react-dnd'

declare module 'dnd' {
  type DragSource = {
    drag: ConnectDragSource
  }
  type DragPreview = {
    preview: ConnectDragPreview
  }
}
