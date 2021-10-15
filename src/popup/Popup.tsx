import React, { useEffect, useState, createElement } from 'react'
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
import Storage from '@/services/storage'

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
          <TodoList />
        </React.Suspense>
      </RecoilRoot>
    </ErrorBoundary>
  )
}

const todoListTextState = atom({
  key: 'todoListTextState',
  default: selector({
    key: 'savedTodoListTextState',
    get: async () => {
      return (await Storage.get('todo-list-text')) as string
    },
  }),
  effects_UNSTABLE: [
    ({ onSet }) =>
      onSet((text) => {
        void Storage.set('todo-list-text', text)
      }),
  ],
})

const markedHtmlState = selector({
  key: 'markedHtmlState',
  get: ({get}) => {
    const text = get(todoListTextState)
    return convertMarkdownToHtml(text)
  }
})

function TodoList() {
  return (
    <>
      <TodoTextarea />
      <MarkdownHtml />
    </>
  )
}

class TodoItem {
  // for unique Id
  static taskId = 0

  // utility for creating unique Id
  static getId() {
    this.taskId++
    return this.taskId
  }

  public id: number
  public text: string
  public isComplete: boolean

  constructor(text: string) {
    this.id = TodoItem.getId()
    this.text = text
    this.isComplete = false
  }
}

function convertMarkdownToHtml(text: string) : JSX.Element {
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

function TodoTextarea() {
  const [inputValue, setInputValue] = useRecoilState(todoListTextState)

  const onChange = ({ target: { value } }) => {
    setInputValue(value)
  }

  return (
    <div className="h-80">
      <textarea
        className="w-full h-32 px-3 py-1 text-base text-gray-700 bg-white border border-gray-300 rounded outline-none resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 leading-6 transition-colors duration-200 ease-in-out"
        onChange={onChange}
        value={inputValue}
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
  const [inputValue, setInputValue] = useRecoilState(todoListTextState)

  const checkboxProps = children[0].props as TaskCheckBox
  const taskElm = children[2]
  const id = `check-${Math.random()}`

  const toggleItemCompletion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const line = Number(e.target.dataset.line) - 1
    const checked = e.target.checked
    Log.d(
      `checkbox clicked at ${line} to ${checked ? 'true' : 'false'}`,
    )

    // update todo state in markdown text.
    const lines = inputValue.split(/\n/)
    if (checked) {
      lines[line] = lines[line].replace('[ ]', '[x]')
    } else {
      lines[line] = lines[line].replace('[x]', '[ ]')
    }
    const newText = lines.join('\n')
    setInputValue(newText)
  }

  return (
    <div className="flex flex-row items-center p-1 todo-item">
      <div className="checkbox">
        <input
          id={id}
          data-line={`${line}`}
          type="checkbox"
          checked={checkboxProps.checked}
          onChange={toggleItemCompletion}
        />
        <label htmlFor={id}></label>
      </div>
      {taskElm}
    </div>
  )
}

function MarkdownHtml() {
  return useRecoilValue(markedHtmlState)
}
