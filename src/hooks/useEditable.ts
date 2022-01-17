import { useCallback } from 'react'
import { atom, useRecoilState, useSetRecoilState } from 'recoil'
import Log from '@/services/log'

const focusLineState = atom({
  key: 'focusLineState',
  default: 0
})

const editingLineState = atom({
  key: 'editingLineState',
  default: 0
})

type useEditableReturn = [
  boolean, () => void
]

export function useEditable(line: number): useEditableReturn {
  const [focusLine, setFocusLine] = useRecoilState(focusLineState)
  const [editingLine, setEditingLine] = useRecoilState(editingLineState)

  function isEditing() {
    return focusLine === line && editingLine === line
  }

  function focusOrEdit() {
    if (focusLine === line) {
      Log.v(`edit line: ${line}`)
      setEditingLine(line)
    } else {
      Log.v(`focus line: ${line}`)
      setFocusLine(line)
      setEditingLine(0)
    }
  }

  return [isEditing(), focusOrEdit]
}

export function useEditFinish(): () => void {
  const setFocusLine = useSetRecoilState(focusLineState)
  const setEditingLine = useSetRecoilState(editingLineState)

  return useCallback(() => {
    setFocusLine(0)
    setEditingLine(0)
  }, [])
}
