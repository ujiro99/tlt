import React from 'react'
import classnames from 'classnames'

import { Chart as ChartJS, ArcElement } from 'chart.js'
import { Pie } from 'react-chartjs-2'

import { aggregate, ifNull } from '@/services/util'
import { nodeToTasks } from '@/models/node'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useMode, MODE } from '@/hooks/useMode'
import * as i18n from '@/services/i18n'
import { Icon } from '@/components/Icon'

import './ReportSummary.css'

ChartJS.register(ArcElement)

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

  const data = {
    labels: [i18n.t('actual'), '---'],
    datasets: [
      {
        data: [props.percentage, 100 - props.percentage],
        backgroundColor: ['rgba(200, 200, 200, 1)', 'rgba(240, 240, 240, 1)'],
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

  // --- Summary
  const tasks = nodeToTasks(root, false)
  const all = aggregate(tasks)

  const onClick = () => {
    setMode(MODE.REPORT)
  }

  return (
    <div className="report-summary">
      <div
        className={classnames('report-summary__container', {
          'report-summary__container--fixed': props.fixed,
        })}
        onClick={onClick}
      >
        <Icon className="report-summary__icon" name="assessment" />
        <span>{i18n.t('actual')}</span>
        <span className="pl-5">{ifNull(all.actual.toString())}</span>
        <span className="pl-5">/</span>
        <span className="pl-5">{i18n.t('estimate')}</span>
        <span className="pl-5">{ifNull(all.estimate.toString())}</span>
        <span className="pl-5">:</span>
        <span className="pl-5">{ifNull(all.percentage)}</span>
        <span className="pl-2">%</span>
        <div className="report-summary__circle">
          <PieChart percentage={all.percentage} />
        </div>
      </div>
    </div>
  )
}
