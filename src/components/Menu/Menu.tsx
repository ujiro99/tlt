import React from 'react'

import { Calendar } from '@/components/Menu/Calendar'
import { Copy } from '@/components/Menu/Copy'
import { Edit } from '@/components/Menu/Edit'
import { ButtonGroup } from '@/components/ButtonGroup'
import { aggregate, ifNull } from '@/services/util'
import { nodeToTasks } from '@/models/node'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useMode, MODE } from '@/hooks/useMode'
import * as i18n from '@/services/i18n'

export function Menu(): JSX.Element {
  const [mode, setMode] = useMode()
  const manager = useTaskManager()
  const root = manager.getRoot()

  // --- Summary
  const tasks = nodeToTasks(root, false)
  const all = aggregate(tasks)

  const onChange = ({ name }) => {
    setMode(name)
  }

  const buttonProps = [
    {
      name: MODE.SHOW,
      label: i18n.t('label_todo'),
      iconName: 'check',
    },
    {
      name: MODE.REPORT,
      label: i18n.t('label_report'),
      iconName: 'assessment',
    },
  ]

  return (
    <div className="sticky top-0 z-10 w-full pt-6 pl-4 bg-gray-100">
      <Calendar />
      <div className="text-xs select-none font-mono text-gray-500 ml-[10px] mt-[0.8em]">
        <span>{i18n.t('actual')}</span>
        <span className="pl-[0.8em] text-gray-600 tracking-wider">{ifNull(all.actual.toString())}</span>
        <span className="pl-[0.5em]">/</span>
        <span className="pl-[0.5em]">{i18n.t('estimate')}</span>
        <span className="pl-[0.8em] text-gray-600 tracking-wider">{ifNull(all.estimate.toString())}</span>
        <span className="pl-[0.5em]">:</span>
        <span className="pl-[0.5em] text-gray-600 tracking-wider">{ifNull(all.percentage)}</span>
        <span className="pl-[0.25em]">%</span>
      </div>
      <ButtonGroup buttons={buttonProps} onChange={onChange} initial={mode} />
      <div className="absolute z-10 right-1 bottom-1">
        <Edit />
        <Copy />
      </div>
    </div>
  )
}
