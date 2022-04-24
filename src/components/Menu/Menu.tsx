import React from 'react'
import { atom, useRecoilState } from 'recoil'

import { Calendar } from '@/components/Menu/Calendar'
import { Copy } from '@/components/Menu/Copy'
import { Edit } from '@/components/Menu/Edit'
import { ButtonGroup } from '@/components/ButtonGroup'

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

export function Menu(): JSX.Element {
  const [mode, setMode] = useRecoilState(modeState)

  const onChange = ({ name }) => {
    setMode(name)
  }

  const buttonProps = [
    {
      name: MODE.SHOW,
      label: 'ToDo',
      iconName: 'icon-check',
    },
    {
      name: MODE.REPORT,
      label: 'Report',
      iconName: 'icon-assessment',
    },
  ]

  return (
    <div className="relative flex flex-col items-center pt-5 pb-4">
      <Calendar />
      <ButtonGroup buttons={buttonProps} onChange={onChange} initial={mode} />
      <div className="absolute right-0 bottom-[-1rem] z-10 bg-white rounded-bl-xl p-2 pt-0">
        <Edit />
        <Copy />
      </div>
    </div>
  )
}
