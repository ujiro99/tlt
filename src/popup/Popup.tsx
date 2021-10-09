import React, { useEffect, useState } from 'react'
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil'

export default function Popup(): JSX.Element {
  useEffect(() => {
    chrome.runtime.sendMessage({ popupMounted: true })
  }, [])

  return (
    <RecoilRoot>
      <TodoList />
    </RecoilRoot>
  )
}

const todoListState = atom({
  key: 'todoListState',
  default: [],
})

function TodoList() {
  return (
    <>
      <TodoItemCreator />
      <TodoItemList />
    </>
  )
}

function TodoItemCreator() {
  const [inputValue, setInputValue] = useState('')
  const setTodoList = useSetRecoilState(todoListState)

  const addItem = () => {
    setTodoList((oldTodoList) => [
      ...oldTodoList,
      {
        id: getId(),
        text: inputValue,
        isComplete: false,
      },
    ])
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

// utility for creating unique Id
let id = 0
function getId() {
  return id++
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
