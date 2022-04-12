import React, { useEffect } from 'react'
import { RecoilRoot, useRecoilValue } from 'recoil'
import { ErrorFallback } from '@/components/ErrorFallback'
import { TaskTextarea } from '@/components/TaskTextarea'
import { Menu, MODE, modeState } from '@/components/Menu/Menu'
import { EmptyLine } from '@/components/EmptyLine'
import { SortableTree } from '@/components/Tree/SortableTree'
import { useTaskStorage } from '@/hooks/useTaskManager'

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
  useTaskStorage()
  const mode = useRecoilValue(modeState)
  switch (mode) {
    case MODE.EDIT:
      return <TaskTextarea />
    case MODE.SHOW:
      return <MarkdownHtml />
    case MODE.REPORT:
      return <MarkdownHtml />
  }
}

function MarkdownHtml() {
  return (
    <div className="task-container">
      <SortableTree />
      <EmptyLine />
    </div>
  )
}
