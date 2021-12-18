import React, { useEffect, createElement, ReactElement } from 'react'
import { RecoilRoot, selector, useRecoilState, useRecoilValue } from 'recoil'
import classnames from 'classnames'

import { ErrorBoundary } from 'react-error-boundary'
import type { Position } from 'unist'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeReact from 'rehype-react'

import Log from '@/services/log'
import {
  TaskListState,
  taskListTextState,
  trackingStateList,
} from '@/services/state'

import { Task } from '@/models/task'

import { Counter, CounterStopped } from '@/components/counter'
import { Checkbox } from '@/components/checkbox'
import { TaskController } from '@/components/taskController'
import { TaskTextarea } from '@/components/taskTextarea'
import { Menu, MODE, modeState } from '@/components/menu'

type ErrorFallbackProp = {
  error: Error
}

function ErrorFallback(prop: ErrorFallbackProp) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{prop.error.message}</pre>
    </div>
  )
}

export default function Popup(): JSX.Element {
  useEffect(() => {
    chrome.runtime.sendMessage({ command: 'popupMounted' })
  }, [])

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <RecoilRoot>
        <React.Suspense fallback={<div>Loading...</div>}>
          <Menu />
          <TaskList />
        </React.Suspense>
      </RecoilRoot>
    </ErrorBoundary>
  )
}

const markedHtmlState = selector({
  key: 'markedHtmlState',
  get: ({ get }) => {
    const text = get(taskListTextState)
    return convertMarkdownToHtml(text)
  },
})

function TaskList() {
  const mode = useRecoilValue(modeState)
  switch (mode) {
    case MODE.EDIT:
      return <TaskTextarea />
    case MODE.SHOW:
      return <MarkdownHtml />
  }
}

function convertMarkdownToHtml(text: string): JSX.Element {
  // Log.d('exec convertMarkdownToHtml')
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeReact, {
      createElement: createElement,
      passNode: true,
      components: {
        li: transListItem,
      },
    })
    .processSync(text).result
}

type Node = {
  children: []
  position: Position
  properties: unknown
  tagName: string
  type: string
}

type TransListItemProps = {
  children: ReactElement[]
  className: string
  node: Node
}

function transListItem(_props: unknown) {
  const props = _props as TransListItemProps

  if (props.className !== 'task-list-item') {
    return <li className={props.className}>{props.children}</li>
  }

  let checkboxProps: TaskCheckBox
  let line: number
  let subItem: ReactElement
  let p: JSX.ElementChildrenAttribute
  for (const child of props.children) {
    switch (child.type) {
      case 'input':
        checkboxProps = child.props as unknown as TaskCheckBox
        line = props.node.position.start.line
        break
      case 'ul':
        subItem = child
        break
      case 'p':
        p = child.props as JSX.ElementChildrenAttribute
        checkboxProps = (p.children as ReactElement[])[0]
          .props as unknown as TaskCheckBox
        line = props.node.position.start.line
        break
      default:
        break
    }
  }

  return (
    <li className={props.className}>
      <TaskItem checkboxProps={checkboxProps} line={line} />
      {subItem == null ? <></> : <div>{subItem}</div>}
    </li>
  )
}

type TaskCheckBox = {
  type: string
  checked: boolean
  disabled: boolean
}

type TaskItemProps = {
  checkboxProps: TaskCheckBox
  line: number
}

function TaskItem(props: TaskItemProps) {
  const checkboxProps = props.checkboxProps
  const line = props.line
  const state = TaskListState()
  const [trackings, setTrackings] = useRecoilState(trackingStateList)
  const tracking = trackings.find((n) => n.line === line)
  const task = Task.parse(state.getTextByLine(line))
  const id = `check-${task.id}`

  const toggleItemCompletion = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTracking()) {
      // If task has been tracking, stop automatically.
      stopTracking()
    }

    const checked = e.target.checked
    Log.d(`checkbox clicked at ${line} to ${checked ? 'true' : 'false'}`)
    task.setComplete(checked)
    void state.setTextByLine(line, task.toString())
  }

  const startTracking = () => {
    const trackingStartTime = task.trackingStart()
    const newTracking = {
      line: line,
      isTracking: true,
      trackingStartTime: trackingStartTime,
      elapsedTime: task.actualTimes,
    }
    setTrackings([...trackings, newTracking])
    chrome.runtime.sendMessage({
      command: 'startTracking',
      param: task.actualTimes.minutes,
    })
  }

  const stopTracking = () => {
    if (isTracking()) {
      chrome.runtime.sendMessage({ command: 'stopTracking' })
      const newTrackings = trackings.filter((n) => n.line !== line)
      setTrackings(newTrackings)

      // update markdown text
      task.trackingStop(tracking.trackingStartTime)
      void state.setTextByLine(line, task.toString())
    }
  }

  const isTracking = () => {
    if (tracking == null) return false
    return tracking.isTracking
  }

  const taskItemClass = classnames({
    'task-item': true,
    'task-item--running': isTracking(),
  })

  const style = {
    marginLeft: `${task.indent / 4}em`,
  }

  return (
    <div className={taskItemClass} style={style}>
      <Checkbox
        id={id}
        checked={checkboxProps.checked}
        onChange={toggleItemCompletion}
      />
      <span className="flex-grow ml-2">{task.title}</span>
      {isTracking() ? (
        <Counter startTime={tracking.elapsedTime} />
      ) : !task.actualTimes.isEmpty() ? (
        <CounterStopped startTime={task.actualTimes} />
      ) : (
        <div></div>
      )}
      {!task.isComplete() && (
        <TaskController
          onClickStart={startTracking}
          onClickStop={stopTracking}
          isTracking={isTracking()}
        />
      )}
    </div>
  )
}

function MarkdownHtml() {
  return <div className="task-container">{useRecoilValue(markedHtmlState)}</div>
}
