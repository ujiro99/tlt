import React, { useEffect, createElement, ReactElement } from 'react'
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from 'recoil'
import classnames from 'classnames'

import { ErrorBoundary } from 'react-error-boundary'
import type { Position } from 'unist'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeReact from 'rehype-react'

import Log from '@/services/log'
import { STORAGE_KEY, Storage } from '@/services/storage'
import { Icon } from '@/services/icon'

import { Task, TASK_EVENT } from '@/models/task'
import { Time } from '@/models/time'

import { Counter, CounterStopped } from '@/components/counter'
import { Checkbox } from '@/components/checkbox'
import { TaskController } from '@/components/taskController'

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
        <Menu />
        <React.Suspense fallback={<div>Loading...</div>}>
          <TaskList />
        </React.Suspense>
      </RecoilRoot>
    </ErrorBoundary>
  )
}

/**
 * Task text saved in chrome storage.
 */
const taskListTextState = atom({
  key: 'taskListTextState',
  default: selector({
    key: 'savedTaskListTextState',
    get: async () => {
      return (await Storage.get(STORAGE_KEY.TASK_LIST_TEXT)) as string
    },
  }),
})

type TrackingState = {
  line: number
  isTracking: boolean
  trackingStartTime: number /** [milli second] */
  elapsedTime: Time
}

type TimeObject = {
  _seconds: number
  _minutes: number
  _hours: number
  _days: number
}

const trackingStateList = atom({
  key: 'trackingStateList',
  default: selector({
    key: 'savedTrackingStateList',
    get: async () => {
      const trackings = (await Storage.get(
        STORAGE_KEY.TRACKING_STATE,
      )) as TrackingState[]
      if (!trackings) return []

      return trackings.map((tracking) => {
        // Convert time object to Time class's instance.
        const obj = tracking.elapsedTime as unknown as TimeObject
        tracking.elapsedTime = new Time(
          obj._seconds,
          obj._minutes,
          obj._hours,
          obj._days,
        )

        // If the tracking is in progress, update the elapsed time to resume counting.
        if (tracking.isTracking) {
          const elapsedTimeMs = Date.now() - tracking.trackingStartTime
          const elapsedTime = Time.parseMs(elapsedTimeMs)
          tracking.elapsedTime.add(elapsedTime)
        }

        return tracking
      })
    },
  }),
  effects_UNSTABLE: [
    ({ onSet }) => {
      onSet((state) => {
        // Automatically save the tracking status.
        void Storage.set(STORAGE_KEY.TRACKING_STATE, state)
      })
    },
  ],
})

const MODE = {
  EDIT: 'EDIT',
  SHOW: 'SHOW',
}

/**
 * Ui mode.
 */
const modeState = atom({
  key: 'modeState',
  default: MODE.SHOW,
})

function TaskListState() {
  const [textValue, setTextValue] = useRecoilState(taskListTextState)

  const setText = async (value: string) => {
    setTextValue(value)
    await Storage.set(STORAGE_KEY.TASK_LIST_TEXT, value)
  }

  return {
    text: textValue,
    setText: async (value: string) => {
      await setText(value)
    },
    getTextByLine: (line: number) => {
      const lines = textValue.split(/\n/)
      line = line - 1 //  line number starts from 1.

      if (lines.length > line) return lines[line]
      Log.e('The specified line does not exist.')
      Log.d(`lines.length: ${lines.length}, line: ${line}`)
      return ''
    },
    setTextByLine: async (line: number, text: string) => {
      const lines = textValue.split(/\n/)
      line = line - 1 //  line number starts from 1.

      if (lines.length > line) {
        lines[line] = text
        const newText = lines.join('\n')
        await setText(newText)
      } else {
        Log.e('The specified line does not exist.')
        Log.d(`lines.length: ${lines.length}, line: ${line}`)
      }
    },
  }
}

const markedHtmlState = selector({
  key: 'markedHtmlState',
  get: ({ get }) => {
    const text = get(taskListTextState)
    return convertMarkdownToHtml(text)
  },
})

function Menu() {
  const [mode, setMode] = useRecoilState(modeState)
  const isEdit = mode === MODE.EDIT
  const label = isEdit ? 'Complete' : 'Edit'

  const toggleMode = () => {
    const nextMode = isEdit ? MODE.SHOW : MODE.EDIT
    setMode(nextMode)
  }

  return (
    <div className="text-right">
      <button
        className="w-20 py-1.5 my-2 text-xs right-1 bg-gray-100 hover:bg-gray-50 border border-gray-200 shadow rounded-md transition ease-out"
        onClick={toggleMode}
      >
        {label}
      </button>
    </div>
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

function TaskTextarea() {
  const state = TaskListState()

  const onChange = ({ target: { value } }) => {
    void state.setText(value)
  }

  return (
    <div className="task-textarea">
      <textarea className="" onChange={onChange} value={state.text}></textarea>
    </div>
  )
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

  // Log.d(task)

  // On unmount, if task has been trakcing, stop automatically.
  useEffect(function () {
    return () => stopTracking()
  })

  const toggleItemCompletion = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTracking()) {
      // If task has been tracking, stop automatically.
      task.trackingStop(tracking.trackingStartTime)
    }

    const checked = e.target.checked
    Log.d(`checkbox clicked at ${line} to ${checked ? 'true' : 'false'}`)
    task.setComplete(checked)
  }

  task.on(TASK_EVENT.STRING_CHANGE, (taskStr: string) => {
    void state.setTextByLine(line, taskStr)
  })

  task.on(TASK_EVENT.TRACKING_STATE_CHANGE, (isTracking: boolean) => {
    if (!isTracking) {
      const newTrackings = trackings.filter((n) => n.line !== line)
      setTrackings(newTrackings)
    }
  })

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
      task.trackingStop(tracking.trackingStartTime)
      chrome.runtime.sendMessage({ command: 'stopTracking' })
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
