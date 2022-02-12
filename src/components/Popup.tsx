import React, { useEffect } from 'react'
import { RecoilRoot, useRecoilValue } from 'recoil'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { ErrorFallback } from '@/components/ErrorFallback'
import { TaskTextarea } from '@/components/TaskTextarea'
import { Menu, MODE, modeState } from '@/components/Menu'
import { TaskContainer } from '@/components/TaskContainer'
import { EmptyLine } from '@/components/EmptyLine'
import { TaskTextState } from '@/services/state'
import { Parser } from '@/services/parser'

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
  const state = TaskTextState()
  const rootNode = Parser.parseMd(state.text)

  return (
    <DndProvider debugMode={true} backend={HTML5Backend}>
      <div className="task-container">
        <TaskContainer nodes={rootNode.children} />
        <EmptyLine />
      </div>
    </DndProvider>
  )
}
