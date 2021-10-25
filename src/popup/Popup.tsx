import React, { useEffect, createElement } from 'react'
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
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
import { Task } from "@/models/task"

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

const savingState = atom({
  key: 'savingState',
  default: 0,
})

const taskListTextState = atom({
  key: 'taskListTextState',
  default: selector({
    key: 'savedTaskListTextState',
    get: async () => {
      return (await Storage.get(STORAGE_KEY.TASK_LIST_TEXT)) as string
    },
  }),
})

function TaskListTextState() {
  const [inputValue, setInputValue] = useRecoilState(taskListTextState)
  const setSaving = useSetRecoilState(savingState)

  return {
    taskListText: inputValue,
    setTaskListText: async (value: string) => {
      setInputValue(value)
      setSaving(0)
      await Storage.set(STORAGE_KEY.TASK_LIST_TEXT, value)
      setSaving(1)
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
      <SavedState />
    </>
  )
}

function convertMarkdownToHtml(text: string): JSX.Element {
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
  const state = TaskListTextState()

  const onChange = ({ target: { value } }) => {
    void state.setTaskListText(value)
  }

  return (
    <div className="h-80">
      <textarea
        className="w-full h-32 px-3 py-1 text-base text-gray-700 bg-white border border-gray-300 rounded outline-none resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 leading-6 transition-colors duration-200 ease-in-out"
        onChange={onChange}
        value={state.taskListText}
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

type TransListItemProps = { children: unknown; className: string; node: Node }

function transListItem(_props: unknown) {
  const props = _props as TransListItemProps
  const line = props.node.position.start.line
  if (props.className === 'task-list-item') {
    const taskItemChildren = props.children as TaskItemChildren
    return (
      <li className={props.className}>{TaskItem(taskItemChildren, line)}</li>
    )
  } else {
    return <li className={props.className}>{props.children}</li>
  }
}

type TaskCheckBox = {
  type: string
  checked: boolean
  disabled: boolean
}

type TaskItemChildren = [React.Component, string, string]

function TaskItem(children: TaskItemChildren, line: number) {
  const state = TaskListTextState()

  const checkboxProps = children[0].props as TaskCheckBox
  const taskTitle = children[2]
  const id = `check-${Math.random()}`
  const lineStr = `${line}`

  const toggleItemCompletion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const line = Number(e.target.dataset.line) - 1
    const checked = e.target.checked
    Log.d(`checkbox clicked at ${line} to ${checked ? 'true' : 'false'}`)

    // update task state in markdown text.
    const lines = state.taskListText.split(/\n/)
    if (checked) {
      lines[line] = lines[line].replace('[ ]', '[x]')
    } else {
      lines[line] = lines[line].replace('[x]', '[ ]')
    }
    const newText = lines.join('\n')
    void state.setTaskListText(newText)
  }

  return (
    <div className="flex flex-row items-center p-1 task-item">
      <div className="checkbox">
        <input
          id={id}
          data-line={lineStr}
          type="checkbox"
          checked={checkboxProps.checked}
          onChange={toggleItemCompletion}
        />
        <label htmlFor={id}></label>
      </div>
      <span className="ml-2">{taskTitle}</span>
      <div className="task-controll"></div>
    </div>
  )
}

function MarkdownHtml() {
  return useRecoilValue(markedHtmlState)
}

function SavedState() {
  const count = useRecoilValue(savingState)
  return <pre>{count}</pre>
}
