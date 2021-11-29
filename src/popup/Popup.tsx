import React, { useState, useEffect, createElement, ReactElement } from 'react'
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from 'recoil'

import { ErrorBoundary } from 'react-error-boundary'
import type { Position } from 'unist'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeReact from 'rehype-react'

import Log from '@/services/log'
import { STORAGE_KEY, Storage } from '@/services/storage'
import { Task, TASK_EVENT } from '@/models/task'
import { Time } from '@/models/time'

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
    chrome.runtime.sendMessage({ popupMounted: true })
  }, [])

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <RecoilRoot>
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

type CounterProps = {
  id: number
  startTime: Time
}

function Counter(props: CounterProps) {
  const [count, setCount] = useState(props.startTime.toSeconds())

  useEffect(() => {
    const timerId = setInterval(() => {
      setCount((count) => count + 1)
    }, 1000)
    return () => clearInterval(timerId)
  }, [])

  const time = Time.parseSecond(count)
  return <div className="counter">{time.toClockString()}</div>
}

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

function TaskList() {
  return (
    <>
      <TaskTextarea />
      <MarkdownHtml />
    </>
  )
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
    <div className="h-80">
      <textarea
        className="w-full h-32 px-3 py-1 text-base text-gray-700 bg-white border border-gray-300 rounded outline-none resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 leading-6 transition-colors duration-200 ease-in-out"
        onChange={onChange}
        value={state.text}
      ></textarea>
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

  if (subItem == null) {
    return <li className={props.className}>{TaskItem(checkboxProps, line)}</li>
  } else {
    return (
      <li className={props.className}>
        {TaskItem(checkboxProps, line)}
        <div>{subItem}</div>
      </li>
    )
  }
}

type TaskCheckBox = {
  type: string
  checked: boolean
  disabled: boolean
}

function TaskItem(checkboxProps: TaskCheckBox, line: number) {
  const state = TaskListState()
  const [trackings, setTrackings] = useRecoilState(trackingStateList)
  const tracking = trackings.find((n) => n.line === line)
  const task = Task.parse(state.getTextByLine(line))
  const id = `check-${task.id}`

  Log.d(task)

  const toggleItemCompletion = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }

  const stopTracking = () => {
    task.trackingStop(tracking.trackingStartTime)
  }

  const isTracking = () => {
    if (tracking == null) return false
    return tracking.isTracking
  }

  const indent = {
    textIndent: `${task.indent / 4}em`,
  }

  return (
    <div className="flex flex-row items-center p-1 task-item" style={indent}>
      <div className="checkbox">
        <input
          id={id}
          type="checkbox"
          checked={checkboxProps.checked}
          onChange={toggleItemCompletion}
        />
        <label htmlFor={id}></label>
      </div>
      <span className="ml-2">{task.title}</span>
      <div className="task-controll">
        {!isTracking() ? (
          <button
            className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
            onClick={startTracking}
          >
            Start
          </button>
        ) : (
          <div>
            <button
              className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
              onClick={stopTracking}
            >
              Stop
            </button>
            <Counter id={line} startTime={tracking.elapsedTime} />
          </div>
        )}
      </div>
    </div>
  )
}

function MarkdownHtml() {
  return useRecoilValue(markedHtmlState)
}
