import React from 'react'
import { atom, useRecoilState } from 'recoil'

import { useTaskManager } from '@/hooks/useTaskManager'
import { flat } from '@/models/flattenedNode'
import { INode, NODE_TYPE } from '@/models/node'
import { Tag } from '@/models/tag'
import { Task } from '@/models/task'
import { Group } from '@/models/group'
import { Time } from '@/models/time'
import { asciiBar } from '@/services/util'

import table from 'text-table'

const BarLength = 40

/**
 * Report text.
 */
export const reportState = atom<string>({
  key: 'reportState',
  default: '',
})

function zero() {
  return new Time()
}

function ifNull(num: number, alt = '-'): number | string {
  if (num) return num
  return alt
}

type TimeTotal = {
  actual: Time
  estimate: Time
  percentage: number
}

type TimeCollection = { [key: string]: Time }

function aggregate(tasks: Task[]): TimeTotal {
  const actual = tasks.reduce((a, c) => a.add(c.actualTimes), zero())
  const estimate = tasks.reduce((a, c) => a.add(c.estimatedTimes), zero())
  const percentage = Math.floor(actual.divide(estimate) * 100)
  return {
    actual,
    estimate,
    percentage,
  }
}

type TimeSummary = {
  name: string
  actual: string
  barLen: number
}

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

function nodeToTasks(root: INode, completed: boolean): Task[] {
  let tasks: Task[] = flat(root)
    .filter((n) => n.node.type === NODE_TYPE.TASK)
    .map((n) => n.node.data) as Task[]
  if (completed) {
    tasks = tasks.filter((t) => t.isComplete())
  }
  return tasks
}

export function Report(): JSX.Element {
  const [report, setReport] = useRecoilState(reportState)
  const manager = useTaskManager()
  const root = manager.getRoot()
  const onlyCompleted = true
  let builder = ''

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

  const tagNames = tasks.reduce((a, c) => {
    c.tags.forEach((t) => a.add(t.name))
    return a
  }, new Set<string>())

  const tagTimes = {} as TimeCollection
  let tagDetails = []

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
  const tagTable = [['tag', 'actual', 'estimate', 'a/e', 'amount', 'avg.']]
  tagDetails.forEach((row) => {
    tagTable.push([
      row[0],
      row[1].toString(),
      row[2].toString(),
      `${row[3]}%`,
      row[4],
      row[5].toString(),
    ])
  })

  builder += '\n\n## Total by tags\n\n'
  builder += table(tsTable)
  builder += `\n\n`
  builder += table(tagTable)

  // Total by heading

  const groupTimes = {} as TimeCollection
  const groups = flat(root)
    .filter((n) => n.node.type === NODE_TYPE.HEADING)
    .map((n) => n.node)
  const gdTable = [
    ['group', 'actual', 'estimate', 'a/e', 'amount', 'avg.'],
    ...groups.reduce<string[][]>((acc, group) => {
      const tasks = nodeToTasks(group, onlyCompleted)
      const gt = aggregate(tasks)
      const g = group.data as Group
      groupTimes[g.title] = gt.actual
      const row = [
        g.title,
        gt.actual.toString(),
        gt.estimate.toString(),
        `${gt.percentage}%`,
      ]
      acc.push(row)

      if (g.tags.length > 0) {
        g.tags.forEach((tag) => {
          if (tag.quantity > 0) {
            const avg = Time.parseSecond(gt.actual.toSeconds() / tag.quantity)
            const row = [
              ` - ${tag.name}`,
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
  ]

  const groupSummary = summary(groupTimes, all.actual)
  const gsTable = groupSummary.map((row) => {
    return [row.name, row.actual, asciiBar(row.barLen, 30, false)]
  })

  builder += '\n\n\n## Total by groups\n\n'
  builder += table(gsTable)
  builder += `\n\n`
  builder += table(gdTable)

  setReport(builder)

  return (
    <section className="h-full p-6 pt-2 pb-[80px] overflow-scroll tracking-wide text-gray-700 report-data">
      <h2 className="pt-2 pb-6 text-lg font-bold report-data__title">
        Today's report
      </h2>
      <div className="pt-2 report-data__content">
        <pre className="font-mono text-sm text-gray-600">{report}</pre>
      </div>
    </section>
  )
}
