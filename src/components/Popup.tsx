import React, { useEffect } from 'react'
import { RecoilRoot } from 'recoil'
import { ErrorFallback } from '@/components/ErrorFallback'
import { TaskTextarea } from '@/components/TaskTextarea'
import { useMode, MODE } from '@/hooks/useMode'
import { Menu } from '@/components/Menu/Menu'
import { EmptyLine } from '@/components/EmptyLine'
import { SortableTree } from '@/components/Tree/SortableTree'
import { Report } from '@/components/Report'
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
  const [mode] = useMode()
  switch (mode) {
    case MODE.EDIT:
      return <TaskTextarea />
    case MODE.SHOW:
      return <ToDo />
    case MODE.REPORT:
      return <Report />
  }
}

function ToDo() {
  return (
    <div className="task-container">
      <SortableTree />
      <EmptyLine />
    </div>
  )
}
