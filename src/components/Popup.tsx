import React, {
  useEffect,
  createElement,
  ReactElement,
} from 'react'
import { RecoilRoot, selector, useRecoilValue } from 'recoil'
import { ErrorBoundary } from 'react-error-boundary'
import type { Position } from 'unist'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeReact from 'rehype-react'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import {
  taskListTextState,
  TaskTextState,
  dragMotionState,
} from '@/services/state'
import Log from '@/services/log'

import { DraggableListItem } from '@/components/DraggableListItem'
import { TaskTextarea } from '@/components/TaskTextarea'
import { TaskItem, TaskCheckBox } from '@/components/TaskItem'
import { Menu, MODE, modeState } from '@/components/Menu'

import { useDragMotion } from '@/hooks/useDragMotion'

import '@/components/Popup.css'

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
  return (
    <DndProvider debugMode={true} backend={HTML5Backend}>
      <div className="task-container">{useRecoilValue(markedHtmlState)}</div>
    </DndProvider>
  )
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
        li: TransListItem,
        h1: TransHeading,
        h2: TransHeading,
        h3: TransHeading,
        h4: TransHeading
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

type TransProps = {
  children: ReactElement[]
  className: string
  node: Node
}

const TransListItem: React.FC<unknown> = (props: TransProps): JSX.Element => {
  const line = props.node.position.start.line
  const inList = props.node.position.start.column > 1

  const dragMotions = useRecoilValue(dragMotionState)
  const dragItem = dragMotions.find((n) => n.line === line)
  const motionStyles = useDragMotion(dragItem?.props, false, true)

  if (props.className !== 'task-list-item') {
    return <li className={props.className}>{props.children}</li>
  }

  let checkboxProps: TaskCheckBox
  let subItem: ReactElement
  let subItemCount = 0
  let p: JSX.ElementChildrenAttribute
  for (const child of props.children) {
    switch (child.type) {
      case 'input':
        checkboxProps = child.props as unknown as TaskCheckBox
        break
      case 'ul':
        subItem = child
        p = child.props as JSX.ElementChildrenAttribute
        subItemCount = (p.children as ReactElement<TransProps>[]).filter(
          (n) => n.props?.className === 'task-list-item',
        ).length
        break
      case 'p':
        p = child.props as JSX.ElementChildrenAttribute
        checkboxProps = (p.children as ReactElement[])[0]
          .props as unknown as TaskCheckBox
        break
      default:
        break
    }
  }

  // Checks whether it is at the top of the list
  const state = TaskTextState()
  const isListTop = !state.isTaskStrByLine(line - 1)

  return (
    <DraggableListItem
      className={props.className}
      line={line}
      isListTop={isListTop}
      inList={inList}
      motionParams={dragItem?.props}
      hasChildren={subItem != null}
      childrenCount={subItemCount}
    >
      {subItem ? (
        <>
          <TaskItem
            checkboxProps={checkboxProps}
            line={line}
            style={motionStyles}
          />
          {subItem}
        </>
      ) : (
        <TaskItem checkboxProps={checkboxProps} line={line} />
      )}
    </DraggableListItem>
  )
}

const TransHeading: React.FC<unknown> = (props: TransProps): JSX.Element => {
  const line = props.node.position.start.line
  const dragMotions = useRecoilValue(dragMotionState)
  const dragItem = dragMotions.find((n) => n.line === line)
  const motionStyles = useDragMotion(dragItem?.props)

  const TagName = props.node.tagName as keyof JSX.IntrinsicElements

  return (
    <TagName style={motionStyles} className={props.className}>
      {props.children}
    </TagName>
  )
}
