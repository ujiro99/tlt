import React from 'react'
import { atom, useRecoilState } from 'recoil'

import { TaskTextState, TaskState } from '@/services/state'

import { Tooltip } from '@/components/tooltip'

export const MODE = {
  EDIT: 'EDIT',
  SHOW: 'SHOW',
} as const
export type MenuMode = typeof MODE[keyof typeof MODE]

/**
 * Ui mode.
 */
export const modeState = atom<MenuMode>({
  key: 'modeState',
  default: MODE.SHOW,
})

function Copy(): JSX.Element {
  const state = TaskTextState()

  const copyMarkdown = () => {
    void navigator.clipboard.writeText(state.text)
  }

  return (
    <button
      className="w-8 py-1.5 my-2 text-xs text-gray-500 bg-gray-100 hover:bg-gray-50 border-none shadow rounded-md transition ease-out"
      onClick={copyMarkdown}
    >
      <svg className="icon">
        <use xlinkHref="/icons.svg#icon-copy" />
      </svg>
      <Tooltip show={true} location={'bottom'}>
        <span>copied!</span>
      </Tooltip>
    </button>
  )
}

export function Menu(): JSX.Element {
  const [mode, setMode] = useRecoilState(modeState)
  const isEdit = mode === MODE.EDIT
  const label = isEdit ? 'Complete' : 'Edit'
  const taskState = TaskState()

  const toggleMode = () => {
    const nextMode = isEdit ? MODE.SHOW : MODE.EDIT
    if (nextMode === MODE.EDIT) {
      // Automatically stop tracking before entering edit mode.
      taskState.stopAllTracking()
    }
    setMode(nextMode)
  }

  return (
    <div className="text-right">
      <Copy />
      <button
        className="w-20 py-1.5 ml-2 my-2 text-xs right-1 bg-gray-100 hover:bg-gray-50 border-none shadow rounded-md transition ease-out"
        onClick={toggleMode}
      >
        {label}
      </button>
    </div>
  )
}
