import React, { useState } from 'react'
import { atom, useRecoilState } from 'recoil'

import { Tooltip } from '@/components/Tooltip'
import { Calendar } from '@/components/Menu/Calendar'
import { Copy } from '@/components/Menu/Copy'
import { Edit } from '@/components/Menu/Edit'
import { ButtonGroup } from '@/components/ButtonGroup'

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
  REPORT: 'REPORT',
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

export function Menu(): JSX.Element {
  const [mode, setMode] = useRecoilState(modeState)

  const onChange = ({ name }) => {
    setMode(name)
  }

  const buttonProps = [
    {
      name: MODE.SHOW,
      label: 'Task',
      iconName: 'icon-check',
    },
    {
      name: MODE.REPORT,
      label: 'Report',
      iconName: 'icon-assessment',
    },
  ]

  return (
    <div className="px-2.5 py-1.5 flex items-center">
      <div className="flex-1">
        <Calendar />
      </div>
      <ButtonGroup buttons={buttonProps} onChange={onChange} initial={mode} />
      <div className="flex-1 text-right">
        <Clear />
        <Edit />
        <Copy />
      </div>
    </div>
  )
}
