import React, { useEffect } from 'react'
import { RecoilRoot, useRecoilValue } from 'recoil'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { ErrorFallback } from '@/components/ErrorFallback'
import { TaskTextarea } from '@/components/TaskTextarea'
import { Menu, MODE, modeState } from '@/components/Menu'
import { MdHeading } from '@/components/MdHeading'
import { MdListItem } from '@/components/MdListItem'
import { TaskTextState } from '@/services/state'
import { useMarkdown } from '@/hooks/useMarkdown'
import '@/components/Popup.css'

export default function Popup(): JSX.Element {
  useEffect(() => {
    chrome.runtime.sendMessage({ command: 'popupMounted' })
  }, [])

  return (
    <ErrorFallback>
      <RecoilRoot>
        <React.Suspense fallback={<div>Loading...</div>}>
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
  const state = TaskTextState()
  const converted = useMarkdown(state.text, {
    li: MdListItem,
    h1: MdHeading,
    h2: MdHeading,
    h3: MdHeading,
    h4: MdHeading,
  })

  return (
    <DndProvider debugMode={true} backend={HTML5Backend}>
      <div className="task-container">{converted}</div>
    </DndProvider>
  )
}
