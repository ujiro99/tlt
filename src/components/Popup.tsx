import React, { useEffect } from 'react'
import { RecoilRoot } from 'recoil'
import { QueryClient, QueryClientProvider } from 'react-query'
import SimpleBar from 'simplebar-react'

import { ErrorFallback } from '@/components/ErrorFallback'
import { TodoEditor } from '@/components/TodoEditor'
import { useMode, MODE } from '@/hooks/useMode'
import { Menu } from '@/components/Menu/Menu'
import { EmptyLine } from '@/components/EmptyLine'
import { SortableTree } from '@/components/Tree/SortableTree'
import { Report } from '@/components/Report'
import { SyncModal } from '@/components/Sync/SyncModal'
import { AlarmModal } from '@/components/Alarm/AlarmModal'
import { useTaskStorage } from '@/hooks/useTaskStorage'

import 'simplebar-react/dist/simplebar.min.css'
import '@/css/common.css'
import '@/components/Popup.css'

export default function Popup(): JSX.Element {
  useEffect(() => {
    chrome.runtime.sendMessage({ command: 'popupMounted' })
  }, [])

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        suspense: true,
      },
    },
  })

  return (
    <SimpleBar style={{ height: 600 }}>
      <QueryClientProvider client={queryClient}>
        <ErrorFallback>
          <RecoilRoot>
            <React.Suspense fallback={<div></div>}>
              <Init />
              <Menu />
              <TaskList />
            </React.Suspense>
          </RecoilRoot>
        </ErrorFallback>
      </QueryClientProvider>
    </SimpleBar>
  )
}

function Init() {
  useTaskStorage()
  return <></>
}

function TaskList() {
  const [mode] = useMode()
  switch (mode) {
    case MODE.EDIT:
      return <TodoEditor />
    case MODE.SHOW:
      return <ToDo />
    case MODE.REPORT:
      return <Report />
  }
}

function ToDo() {
  return (
    <div className="task-container">
      <SortableTree indicator />
      <EmptyLine />
      <SyncModal />
      <AlarmModal />
    </div>
  )
}
