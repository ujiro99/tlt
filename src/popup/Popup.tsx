import React, { useEffect, createElement, ReactElement } from 'react'
import { RecoilRoot, selector, useRecoilValue } from 'recoil'
import { ErrorBoundary } from 'react-error-boundary'
import type { Position } from 'unist'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeReact from 'rehype-react'

import { taskListTextState } from '@/services/state'
import Log from '@/services/log'

import { TaskTextarea } from '@/components/taskTextarea'
import { TaskItem, TaskCheckBox } from '@/components/taskItem'
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
  return <div className="task-container">{useRecoilValue(markedHtmlState)}</div>
}

const markedHtmlState = selector({
  key: 'markedHtmlState',
  get: ({ get }) => {
    const text = get(taskListTextState)
    return convertMarkdownToHtml(text)
  },
})

function convertMarkdownToHtml(text: string): JSX.Element {
  Log.v('exec convertMarkdownToHtml')
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
