import React from 'react'
import { useTaskManager } from '@/hooks/useTaskManager'
import { flat } from '@/models/flattenedNode'
import { NODE_TYPE } from '@/models/node'
import { Tag } from '@/models/tag'
import { Task } from '@/models/task'
import { Time } from '@/models/time'
import { asciiBar } from '@/services/util'

import table from 'text-table'

const BarLength = 40

function zero() {
  return new Time()
}

function ifNull(num: number, alt = '-'): number | string {
  if (num) return num
  return alt
}

export function Report(): JSX.Element {
  const manager = useTaskManager()
  const root = manager.getRoot()

  const flatten = flat(root)
  let tasks: Task[] = flatten
    .filter((n) => n.node.type === NODE_TYPE.TASK)
    .map((n) => n.node.data) as Task[]
  tasks = tasks.filter((t) => t.isComplete())

  // --- All

  let report = ''

  // Estimated vs Actual
  report += '## Total\n\n'
  const actualTime = tasks.reduce((a, c) => a.add(c.actualTimes), zero())
  const estimatedTime = tasks.reduce((a, c) => a.add(c.estimatedTimes), zero())
  const percentage = Math.floor(actualTime.divide(estimatedTime) * 100)
  const totalTable = [
    ['actual', 'estimate', 'a/e'],
    [actualTime.toString(), estimatedTime.toString(), `${ifNull(percentage)}%`]
  ]

  report += table(totalTable)
  report += `\n${asciiBar(percentage, BarLength)}\n`


  // --- Total by tags
  report += '\n\n## Total by tags\n\n'

  const tagNames = tasks.reduce((a, c) => {
    c.tags.forEach((t) => a.add(t.name))
    return a
  }, new Set<string>())

  const tagTimes = {} as { [key: string]: Time }
  let detailTable = []

  tagNames.forEach((tagName) => {
    const tasksHasTag = tasks.filter((t) =>
      t.tags.some((tt) => tt.name === tagName),
    )
    const actualTime = tasksHasTag.reduce(
      (a, c) => a.add(c.actualTimes),
      zero(),
    )
    const estimatedTime = tasksHasTag.reduce(
      (a, c) => a.add(c.estimatedTimes),
      zero(),
    )
    const percentage = Math.floor(actualTime.divide(estimatedTime) * 100)

    tagTimes[tagName] = actualTime

    const tags = tasksHasTag.reduce((a, c) => {
      const ts = c.tags.filter((t) => t.name === tagName)
      return [...a, ...ts]
    }, [] as Tag[])
    const quantity = tags.reduce((a, c) => a + Math.max(c.quantity, 1), 0)
    const avg = Time.parseSecond(actualTime.toSeconds() / quantity)

    detailTable.push([
      tagName,
      actualTime,
      estimatedTime,
      percentage,
      quantity,
      avg,
    ])
  })

  // sort
  const sortedTags = Object.entries(tagTimes).sort((a, b) => {
    return b[1].toSeconds() - a[1].toSeconds()
  })
  detailTable = detailTable.sort((a, b) => {
    return b[1].toSeconds() - a[1].toSeconds()
  })

  const tagTable2 = []
  for (const entry of sortedTags) {
    const tagName = entry[0]
    const p = Math.floor(
      (tagTimes[tagName].toSeconds() / actualTime.toSeconds()) * 100,
    )
    tagTable2.push([tagName, `${tagTimes[tagName].toHours().toFixed(1)}h`, asciiBar(p, BarLength, false)])
  }

  const tagTable = [
    ['tag', 'actual', 'estimate', 'a/e', 'amount', 'avg.'],
  ]
  detailTable.forEach((row) => {
    tagTable.push([row[0], row[1].toString(), row[2].toString(), `${row[3]}%`, row[4], row[5].toString()])
  })

  report += table(tagTable2)
  report += `\n\n`
  report += table(tagTable)


  // TODO Average by tags number
  // TODO Total heqding

  console.log(report)

  return (
    <section className="p-6 pt-2 tracking-wide text-gray-700 report-data">
      <h2 className="pt-2 pb-6 text-lg font-bold report-data__title">
        Report
      </h2>
      <div className="report-data__content">
        <pre className="font-mono text-sm">{report}</pre>
      </div>
    </section>
  )
}
