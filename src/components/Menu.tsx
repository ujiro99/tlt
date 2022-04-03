import React, { useState } from 'react'
import { atom, useRecoilState } from 'recoil'

import { CalendarIcon } from '@/components/CalendarIcon'
import { Tooltip } from '@/components/Tooltip'

import { useTaskManager } from '@/hooks/useTaskManager'
import { useTrackingState } from '@/hooks/useTrackingState'
import { sleep } from '@/services/util'
import { STORAGE_KEY, Storage } from '@/services/storage'

function clearStorage(): void {
  for (const key in STORAGE_KEY) {
    void Storage.set(STORAGE_KEY[key], null)
  }
}

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

function Clear(): JSX.Element {
  const [tooltipVisible, setTooltipVisible] = useState(false)

  const copyMarkdown = async () => {
    chrome.runtime.sendMessage({ command: 'stopTracking' })
    clearStorage()
    await sleep(100)
    setTooltipVisible(true)
    await sleep(800)
    setTooltipVisible(false)
  }

  return (
    <button
      className="hidden py-1.5 px-2 my-2 mx-2 text-xs bg-gray-100 hover:bg-gray-50 border-none shadow rounded-md transition ease-out"
      onClick={copyMarkdown}
    >
      Clear
      <Tooltip show={tooltipVisible} location={'bottom'}>
        <span>Cleared!</span>
      </Tooltip>
    </button>
  )
}

function Copy(): JSX.Element {
  const manager = useTaskManager()
  const [tooltipVisible, setTooltipVisible] = useState(false)

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(manager.getText())
    await sleep(100)
    setTooltipVisible(true)
    await sleep(800)
    setTooltipVisible(false)
  }

  return (
    <button
      className="w-8 py-1.5 my-2 text-s text-gray-500 bg-gray-100 hover:bg-gray-50 border-none shadow rounded-md transition ease-out"
      onClick={copyMarkdown}
    >
      <svg className="icon">
        <use xlinkHref="/icons.svg#icon-copy" />
      </svg>
      <Tooltip show={tooltipVisible} location={'bottom'}>
        <span>Copied!</span>
      </Tooltip>
    </button>
  )
}

export function Menu(): JSX.Element {
  const { stopAllTracking } = useTrackingState()
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

  return (
    <div className="px-2.5 flex">
      <div>
        <CalendarIcon />
      </div>
      <div className="text-right grow">
        <Clear />
        <Copy />
        <button
          className="w-20 py-2 my-2 ml-2 text-xs bg-gray-100 border-none shadow right-1 hover:bg-gray-50 rounded-md transition ease-out"
          onClick={toggleMode}
        >
          {label}
        </button>
      </div>
    </div>
  )
}
