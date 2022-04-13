import React from 'react'
import { useTaskManager } from '@/hooks/useTaskManager'
import { flat } from '@/models/flattenedNode'
import { NODE_TYPE } from '@/models/node'
import { Task } from '@/models/task'
import { Time } from '@/models/time'
import { asciiBar } from '@/services/util'

const BarLength = 40

export function Report(): JSX.Element {
  const manager = useTaskManager()
  const root = manager.getRoot()

  const flatten = flat(root)
  const tasks: Task[] = flatten
    .filter((n) => n.node.type === NODE_TYPE.TASK)
    .map((n) => n.node.data) as Task[]


  // Actual vs Estimated
  const actualTime = tasks.reduce(
    (acc, cur) => acc.add(cur.actualTimes),
    new Time(),
  )
  const estimatedTime = tasks.reduce(
    (acc, cur) => acc.add(cur.estimatedTimes),
    new Time(),
  )
  const percentage = Math.floor(actualTime.divide(estimatedTime)) * 100

  const report = `
Actual vs Estimated
${actualTime.toString()}  /  ${estimatedTime.toString()}
${asciiBar(percentage, BarLength)}  ${percentage} %
`

// TODO Total heqding
// TODO Total by tags
// TODO Average by tags number

  console.log(report)

  return (
    <section className="p-6 report-data">
      <h2 className="pt-4 pb-3 text-base font-bold report-data__title">Summary</h2>
      <div className="report-data__content">
        <pre className="font-mono text-sm">{report}</pre>
      </div>
    </section>
  )
}
