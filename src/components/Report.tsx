import React, { useState } from 'react'
import { atom, useRecoilState } from 'recoil'
import { color } from 'd3-color'

import { Checkbox } from '@/components/Checkbox'
import { ReportTable, Row } from '@/components/ReportTable'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useTagHistory } from '@/hooks/useTagHistory'
import { flat } from '@/models/flattenedNode'
import { nodeToTasks, NODE_TYPE, INode } from '@/models/node'
import { Tag } from '@/models/tag'
import { Group } from '@/models/group'
import { Time } from '@/models/time'
import { asciiBar, aggregate, ifNull } from '@/services/util'
import Log from '@/services/log'
import * as i18n from '@/services/i18n'

import table from 'text-table'
import './Report.css'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
  ChartType,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
)

const BarLength = 40

const labels = [i18n.t('actual'), i18n.t('estimate')]

const colors = {
  gray200: 'rgb(229, 231, 235)',
  gray400: 'rgb(156, 163, 175)',
  gray500: 'rgb(107, 114, 128)',
  blue: 'rgb(3, 169, 244)',
  orange: 'rgb(255, 138, 101)',
}

/**
 * Report text.
 */
export const reportState = atom<string>({
  key: 'reportState',
  default: '',
})

type TimeCollection = { [key: string]: Time }

type TimeSummary = {
  name: string
  actual: string
  barLen: number
}

type TimeDetail = [
  name: string,
  actual: Time,
  estimate: Time,
  aer: number,
  quantity?: number,
  average?: Time,
]

function summary(collection: TimeCollection, base: Time): TimeSummary[] {
  const sorted = Object.entries(collection).sort((a, b) => {
    return Time.subs(b[1], a[1])
  })
  const arr = [] as TimeSummary[]
  for (const entry of sorted) {
    const name = entry[0]
    const p = Math.floor(collection[name].divide(base) * 100)

    arr.push({
      name,
      actual: `${collection[name].toHours().toFixed(1)}h`,
      barLen: p,
    })
  }
  return arr
}

function addOpacity(colorStr: string, opacity: number): string {
  const clr = color(colorStr)
  clr.opacity = opacity
  return clr.toString()
}

export function Report(): JSX.Element {
  const [report, setReport] = useRecoilState(reportState)
  const [onlyCompleted, setOnlyCompleted] = useState(true)
  const { tags } = useTagHistory()
  const manager = useTaskManager()
  const root = manager.getRoot()
  let builder = ''

  function toggleOnlyCompleted(e: React.ChangeEvent<HTMLInputElement>) {
    setOnlyCompleted(e.target.checked)
  }

  function findColor(tagName: string): string {
    const t = tags.find((t) => t.name === tagName)
    return t?.colorHex || colors.gray400
  }

  // --- All
  const tasks = nodeToTasks(root, onlyCompleted)
  const all = aggregate(tasks)
  const totalTable = [
    ['actual', 'estimate', 'a/e'],
    [
      all.actual.toString(),
      all.estimate.toString(),
      `${ifNull(all.percentage)}%`,
    ],
  ]

  builder += '## Total\n\n'
  builder += table(totalTable)
  builder += `\n${asciiBar(all.percentage, BarLength)}\n`

  // --- Total by tags

  const tagNames = Array.from(
    tasks.reduce((a, c) => {
      c.tags.forEach((t) => a.add(t.name))
      return a
    }, new Set<string>()),
  )
  const isTagExists = tagNames.length > 0

  const tagTimes = {} as TimeCollection
  let tagDetails = [] as TimeDetail[]

  tagNames.forEach((tagName) => {
    const tasksHasTag = tasks.filter((t) =>
      t.tags.some((tt) => tt.name === tagName),
    )
    const tagTotal = aggregate(tasksHasTag)

    tagTimes[tagName] = tagTotal.actual

    const tags = tasksHasTag.reduce((a, c) => {
      const ts = c.tags.filter((t) => t.name === tagName)
      return [...a, ...ts]
    }, [] as Tag[])
    const quantity = tags.reduce((a, c) => a + Math.max(c.quantity, 1), 0)
    const avg = Time.parseSecond(tagTotal.actual.toSeconds() / quantity)

    tagDetails.push([
      tagName,
      tagTotal.actual,
      tagTotal.estimate,
      tagTotal.percentage,
      quantity,
      avg,
    ])
  })

  const tagSummary = summary(tagTimes, all.actual)
  const tsTable = tagSummary.map((row) => {
    return [row.name, row.actual, asciiBar(row.barLen, 30, false)]
  })

  tagDetails = tagDetails.sort((a, b) => {
    return Time.subs(b[1], a[1])
  })
  const tagTable = [
    [i18n.t('tag'), i18n.t('actual'), i18n.t('estimate'), i18n.t('aer'), i18n.t('amount'), i18n.t('avg')],
  ] as Row<string>[]
  tagDetails.forEach((row) => {
    tagTable.push([
      row[0],
      row[1].toString(),
      row[2].toString(),
      `${ifNull(row[3])}%`,
      `${row[4]}`,
      row[5].toString(),
    ])
  })

  builder += '\n\n## Total by tags\n\n'
  builder += table(tsTable)
  builder += `\n\n`
  builder += table(tagTable)

  // Total by heading

  const groupTimes = {} as TimeCollection
  const groupDetails = [] as TimeDetail[]

  const groups = flat(root)
    .filter((n) => n.node.type === NODE_TYPE.HEADING)
    .map((n) => n.node)
    .reduce((acc, cur) => {
      const found = acc.find((a) => {
        return (a.data as Group).title === (cur.data as Group).title
      })
      if (found) {
        const clone = found.clone()
        clone.children = found.children.concat(cur.children)
        acc = acc.filter((a) => a.id !== clone.id)
        acc.push(clone)
      } else {
        acc.push(cur)
      }
      return acc
    }, [] as INode[])
  const isGroupExists = groups.length > 0

  const gdTable = [
    [i18n.t('group'), i18n.t('actual'), i18n.t('estimate'), i18n.t('aer'), i18n.t('amount'), i18n.t('avg')],
    ...groups.reduce<string[][]>((acc, group) => {
      const tasks = nodeToTasks(group, onlyCompleted)
      const gt = aggregate(tasks)
      const g = group.data as Group

      if (gt.actual.isEmpty() && gt.estimate.isEmpty()) {
        // Don't append any data.
        return acc
      }

      groupTimes[g.title] = gt.actual
      const row = [
        g.title,
        gt.actual.toString(),
        gt.estimate.toString(),
        `${gt.percentage}%`,
      ]
      acc.push(row)

      groupDetails.push([g.title, gt.actual, gt.estimate, gt.percentage])

      if (g.tags.length > 0) {
        g.tags.forEach((tag) => {
          if (tag.quantity > 0) {
            const avg = Time.parseSecond(gt.actual.toSeconds() / tag.quantity)
            const row = [
              `  ${tag.name}`,
              '',
              '',
              '',
              `${tag.quantity}`,
              avg.toString(),
            ]
            acc.push(row)
          }
        })
      }
      return acc
    }, []),
  ] as Row<string>[]

  const groupSummary = summary(groupTimes, all.actual)
  const gsTable = groupSummary.map((row) => {
    return [row.name, row.actual, asciiBar(row.barLen, 30, false)]
  })

  builder += '\n\n\n## Total by groups\n\n'
  builder += table(gsTable)
  builder += `\n\n`
  builder += table(gdTable)
  Log.v(gdTable)

  setReport(builder)

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    barThickness: 24,
    scales: {
      x: {
        ticks: {
          callback: function (value: number) {
            return `${Time.parseHour(value).toHours()}h`
          },
          stepSize: 0.5, // 30min
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<ChartType>) {
            const value = context.raw as number
            const label = context.dataset.label || context.label
            return `${label}: ${Time.parseHour(value).toString()}`
          },
        },
      },
      datalabels: {
        formatter: function (value: number) {
          return Time.parseHour(value).toString()
        },
      },
    },
  }

  const allData = {
    labels,
    datasets: [
      {
        data: labels.map((l) => {
          let time: Time
          if (l === labels[0]) time = all.actual
          if (l === labels[1]) time = all.estimate
          return time.toHours()
        }),
        backgroundColor: [
          addOpacity(colors.blue, 0.5),
          addOpacity(colors.orange, 0.5),
        ],
      },
    ],
  }

  const tagData = {
    labels: tagDetails.map((t) => t[0]),
    datasets: [
      {
        label: i18n.t('actual'),
        data: tagDetails.map((t) => t[1].toHours()),
        backgroundColor: tagDetails
          .map((t) => findColor(t[0]))
          .map((c) => addOpacity(c, 0.8)),
      },
      {
        label: i18n.t('estimate'),
        data: tagDetails.map((t) => t[2].toHours()),
        backgroundColor: tagDetails
          .map((t) => findColor(t[0]))
          .map((c) => addOpacity(c, 0.4)),
      },
    ],
  }

  const groupData = {
    labels: groupDetails.map((g) => g[0]),
    datasets: [
      {
        label: i18n.t('actual'),
        data: groupDetails.map((g) => g[1].toHours()),
        backgroundColor: addOpacity(colors.blue, 0.5),
      },
      {
        label: i18n.t('estimate'),
        data: groupDetails.map((g) => g[2].toHours()),
        backgroundColor: addOpacity(colors.orange, 0.5),
      },
    ],
  }

  const barGraphHeight = (barNum: number): number => {
    return Math.max(barNum * 10 + 10, 20)
  }

  return (
    <section className="pt-[34px] p-[28px] tracking-wide text-gray-700 report-data">
      <div className="report-data__setting">
        <label htmlFor="onlyCompleted" className="setting-item">
          <Checkbox
            id="onlyCompleted"
            checked={onlyCompleted}
            onChange={toggleOnlyCompleted}
          />
          <span>{i18n.t('completed_only')}</span>
        </label>
      </div>
      <div className="report-data__content">
        <h2 className="pb-6 mt-0.5 text-base font-bold">{i18n.t('summary')}</h2>

        <div
          className="chart-container"
          style={{ position: 'relative', height: '24vh', width: '85vw' }}
        >
          <Bar options={options} data={allData} />
        </div>

        <section>
          <h2 className="py-6 mt-5 text-base font-bold">
            {i18n.t('total_by_tags')}
          </h2>
          {isTagExists ? (
            <div className="pl-4">
              <div
                className="chart-container"
                style={{
                  position: 'relative',
                  height: `${barGraphHeight(tagDetails.length)}vh`,
                  width: '85vw',
                }}
              >
                <Bar options={options} data={tagData} />
              </div>
              <ReportTable table={tagTable} />
            </div>
          ) : (
            <span>{i18n.t('no_tags')}</span>
          )}
        </section>

        <section>
          <h2 className="py-6 mt-5 text-base font-bold">
            {i18n.t('total_by_groups')}
          </h2>
          {isGroupExists ? (
            <div className="pl-4">
              <div
                className="chart-container"
                style={{
                  position: 'relative',
                  height: `${barGraphHeight(groupDetails.length)}vh`,
                  width: '85vw',
                }}
              >
                <Bar options={options} data={groupData} />
              </div>
              <ReportTable table={gdTable} />
            </div>
          ) : (
            <span>{i18n.t('no_groups')}</span>
          )}
        </section>
      </div>
    </section>
  )
}
