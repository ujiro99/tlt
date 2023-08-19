import React from 'react'
import classnames from 'classnames'

import { Chart as ChartJS, ArcElement } from 'chart.js'
import { Pie } from 'react-chartjs-2'

import { aggregate, ifNull } from '@/services/util'
import { nodeToTasks } from '@/models/node'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useMode, MODE } from '@/hooks/useMode'
import { useAnalytics } from '@/hooks/useAnalytics'
import * as i18n from '@/services/i18n'

import './ReportSummary.css'

ChartJS.register(ArcElement)

const COLOR = {
  BG: 'rgba(240, 240, 240, 1)',
  BG_LIGHT: 'rgba(216, 216, 216, 1)',
  ACTUAL: 'rgba(190, 190, 190, 1)',
  OVER: 'rgba(202, 111, 111, 1)',
}

type Props = {
  percentage: number
}

function PieChart(props: Props): JSX.Element {
  const options = {
    animation: {
      duration: 0,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  }

  let pie = props.percentage
  const overed = props.percentage > 100
  if (overed) {
    pie = props.percentage - 100
  }

  const data = {
    labels: [i18n.t('actual'), '---'],
    datasets: [
      {
        data: [pie, 100 - pie],
        backgroundColor: overed
          ? [COLOR.OVER, COLOR.BG_LIGHT]
          : [COLOR.ACTUAL, COLOR.BG],
        borderWidth: [0, 0],
        datalabels: {
          display: false,
        },
      },
    ],
  }

  return <Pie options={options} data={data} />
}

type ReportSummaryProps = {
  fixed: boolean
}

export function ReportSummary(props: ReportSummaryProps): JSX.Element {
  const [mode, setMode] = useMode()
  const manager = useTaskManager()
  const root = manager.getRoot()
  const analytics = useAnalytics()

  // --- Summary
  const tasks = nodeToTasks(root, false)
  const all = aggregate(tasks)

  const onClick = () => {
    analytics.track('click report')
    setMode(MODE.REPORT)
  }

  return (
    <div
      className={classnames('report-summary', {
        'report-summary--fixed': props.fixed,
      })}
    >
      <div className="report-summary__container" onClick={onClick}>
        <div className="report-summary__circle">
          <PieChart percentage={all.percentage} />
        </div>
        <span className="report-summary__label">{i18n.t('actual')}</span>
        <span className="pl-5">{ifNull(all.actual.toHours().toFixed(1))}h</span>
        <span className="report-summary__label-symbol">/</span>
        <span className="report-summary__label">{i18n.t('estimate')}</span>
        <span className="pl-5">
          {ifNull(all.estimate.toHours().toFixed(1))}h
        </span>
        <span className="report-summary__label-symbol">:</span>
        <span>{ifNull(all.percentage)}</span>
        <span className="pl-2">%</span>
      </div>
    </div>
  )
}
