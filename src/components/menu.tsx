import React from 'react'
import { atom, useRecoilState } from 'recoil'

import { TaskState } from '@/services/state'

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
      <button
        className="w-20 py-1.5 my-2 text-xs right-1 bg-gray-100 hover:bg-gray-50 border border-gray-200 shadow rounded-md transition ease-out"
        onClick={toggleMode}
      >
        {label}
      </button>
    </div>
  )
}
