import React, { useEffect, useState } from 'react'
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil'
import { ErrorBoundary } from 'react-error-boundary'

import Log from '@/services/log'
import Storage from '@/services/storage'

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeReact from 'rehype-react'

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
          <Clear />
        </React.Suspense>
      </RecoilRoot>
    </ErrorBoundary>
  )
}

function onSetHandler(newList: []) {
  void Storage.set('todo-list', newList)
  Log.d(newList)
}

const todoListState = atom({
  key: 'todoListState',
  default: selector({
    key: 'savedTodoListState',
    get: async () => {
      let list = (await Storage.get('todo-list')) as Task[]
      if (!list) list = []
      for (const task of list) {
        if (task.id > Task.taskId) Task.taskId = task.id
      }
      return list
    },
  }),
  effects_UNSTABLE: [({ onSet }) => onSet(onSetHandler)],
})

const markedHtmlState = atom({
  key: 'markedHtmlState',
  default: <div />,
})

function TodoList() {
  return (
    <>
      <TodoTextarea />
      <MarkdownHtml />
    </>
  )
}

class Task {
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
    this.id = Task.getId()
    this.text = text
    this.isComplete = false
  }
}

function TodoTextarea() {
  const [inputValue, setInputValue] = useState('')
  const setMarkedHtmlState = useSetRecoilState(markedHtmlState)

  const onChange = ({ target: { value } }) => {
    console.log(value)
    setInputValue(value)
    setMarkedHtmlState(
      unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeReact, {createElement: React.createElement})
        .processSync(value).result
    )
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

function MarkdownHtml() {
  return useRecoilValue(markedHtmlState)
}

function TodoItemCreator() {
  const [inputValue, setInputValue] = useState('')
  const setTodoList = useSetRecoilState(todoListState)

  const addItem = () => {
    setTodoList((oldTodoList) => [...oldTodoList, new Task(inputValue)])
    setInputValue('')
  }

  const onChange = ({ target: { value } }) => {
    setInputValue(value)
  }

  return (
    <div className="flex flex-row items-end">
      <div className="flex-1">
        <label htmlFor="task-name" className="text-sm text-gray-600 leading-7">
          Task Name
        </label>
        <input
          type="text"
          name="task-name"
          className="w-full px-3 py-1 text-gray-700 bg-gray-100 border border-gray-300 rounded outline-none bg-opacity-50 focus:border-indigo-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 transition-colors duration-200 ease-in-out"
          value={inputValue}
          onChange={onChange}
        />
      </div>
      <button
        className="h-8 px-4 py-1 ml-2 text-sm font-bold text-white bg-indigo-500 border-0 rounded focus:outline-none hover:bg-indigo-600"
        onClick={addItem}
      >
        Add
      </button>
    </div>
  )
}

function TodoItemList() {
  const todoList = useRecoilValue(todoListState)
  return (
    <div className="pt-2 mt-4 border-t divide-y">
      {todoList.map((todoItem) => (
        <TodoItem key={todoItem.id} item={todoItem} />
      ))}
    </div>
  )
}

function TodoItem({ item }) {
  const [todoList, setTodoList] = useRecoilState(todoListState)
  const index = todoList.findIndex((listItem) => listItem === item)

  const editItemText = ({ target: { value } }) => {
    const newList = replaceItemAtIndex(todoList, index, {
      ...item,
      text: value,
    })

    setTodoList(newList)
  }

  const toggleItemCompletion = () => {
    const newList = replaceItemAtIndex(todoList, index, {
      ...item,
      isComplete: !item.isComplete,
    })

    setTodoList(newList)
  }

  const deleteItem = () => {
    const newList = removeItemAtIndex(todoList, index)
    setTodoList(newList)
  }

  return (
    <div className="flex flex-row items-center p-1 todo-item">
      <div className="checkbox">
        <input
          id={'check' + item.id}
          type="checkbox"
          checked={item.isComplete}
          onChange={toggleItemCompletion}
        />
        <label htmlFor={'check' + item.id}></label>
      </div>
      <input
        type="text"
        value={item.text}
        onChange={editItemText}
        className="flex-1 px-2 py-1 ml-2 text-gray-700 rounded outline-none focus:bg-gray-200 duration-200 ease-out"
      />
      <button
        onClick={deleteItem}
        className="px-2 ml-1 rounded hover:bg-gray-300 duration-200 ease-out"
      >
        x
      </button>
    </div>
  )
}

function replaceItemAtIndex(arr, index, newValue) {
  return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)]
}

function removeItemAtIndex(arr, index) {
  return [...arr.slice(0, index), ...arr.slice(index + 1)]
}

function Clear() {
  const setTodoList = useSetRecoilState(todoListState)

  function clearStorage() {
    setTodoList([])
    void Storage.clear()
  }

  return (
    <button
      className="fixed h-8 px-4 py-1 text-sm font-bold text-white bg-indigo-500 border-0 rounded bottom-2 right-2 focus:outline-none hover:bg-indigo-600"
      onClick={clearStorage}
    >
      Clear
    </button>
  )
}
