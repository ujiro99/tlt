import React from 'react'
import { atom, useRecoilState } from 'recoil'

import { TaskListState, trackingStateList } from '@/services/state'

import { Task } from '@/models/task'

export const MODE = {
  EDIT: 'EDIT',
  SHOW: 'SHOW',
} as const;
export type MenuMode = typeof MODE[keyof typeof MODE]

/**
 * Ui mode.
 */
export const modeState = atom<MenuMode>({
  key: 'modeState',
  default: MODE.SHOW,
})

export function Menu(): JSX.Element {
  const state = TaskListState()
  const [trackings, setTrackings] = useRecoilState(trackingStateList)
  const [mode, setMode] = useRecoilState(modeState)
  const isEdit = mode === MODE.EDIT
  const label = isEdit ? 'Complete' : 'Edit'

  const toggleMode = () => {
    const nextMode = isEdit ? MODE.SHOW : MODE.EDIT
    if (nextMode === MODE.EDIT) {
      // Automatically stop tracking before entering edit mode.
      stopAllTracking()
    }
    setMode(nextMode)
  }

  function stopAllTracking() {
    for (const tracking of trackings) {
      if (tracking.isTracking) {
        const task = Task.parse(state.getTextByLine(tracking.line))
        task.trackingStop(tracking.trackingStartTime)
        void state.setTextByLine(tracking.line, task.toString())
      }
    }
    chrome.runtime.sendMessage({ command: 'stopTracking' })
    setTrackings([])
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
