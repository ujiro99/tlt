import React, { useEffect, useState, forwardRef } from 'react'
import { RecoilRoot, useRecoilValue } from 'recoil'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { ErrorFallback } from '@/components/ErrorFallback'
import { TaskTextarea } from '@/components/TaskTextarea'
import { Menu, MODE, modeState } from '@/components/Menu'
import { TaskContainer } from '@/components/TaskContainer'
import { EmptyLine } from '@/components/EmptyLine'
import { TaskTextState } from '@/services/state'
import { Parser } from '@/services/parser'
import { flatten } from '@/services/util'

import '@/components/Popup.css'

export default function Popup(): JSX.Element {
  useEffect(() => {
    chrome.runtime.sendMessage({ command: 'popupMounted' })
  }, [])

  return (
    <ErrorFallback>
      <RecoilRoot>
        <React.Suspense fallback={<div></div>}>
          <Menu />
          <TaskList />
        </React.Suspense>
      </RecoilRoot>
    </ErrorFallback>
  )
}

function TaskList() {
  const mode = useRecoilValue(modeState)
  switch (mode) {
    case MODE.EDIT:
      return <TaskTextarea />
    case MODE.SHOW:
      return <MarkdownHtml />
  }
}

function MarkdownHtml() {
  const [activeId, setActiveId] = useState<string>(null)
  const state = TaskTextState()
  const rootNode = Parser.parseMd(state.text)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragStart(event) {
    const { active } = event
    setActiveId(active.id)
  }

  function handleDragEnd(event) {
    if (!event) {
      return
    }
    const { active, over } = event
    // Perform a row move
    if (active.id !== over.id) {
      state.moveLines(active.id, over.id, 1)
    }
  }

  return (
    <div className="task-container">
      <DndContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
        collisionDetection={closestCenter}
      >
        <SortableContext
          items={flatten(rootNode.children)}
          strategy={verticalListSortingStrategy}
        >
          <TaskContainer nodes={rootNode.children} />
        </SortableContext>
        <DragOverlay>{activeId ? <Item id={activeId} /> : null}</DragOverlay>
      </DndContext>
      <EmptyLine />
    </div>
  )
}

type ItemProps = {
  id: string
}
type DivProps = JSX.IntrinsicElements['div']
const Item = forwardRef<HTMLDivElement, DivProps & ItemProps>(function _Item(
  { id, ...props },
  ref,
) {
  return (
    <div {...props} ref={ref}>
      {id}
    </div>
  )
})
