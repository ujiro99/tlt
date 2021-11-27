import { Task } from '@/models/task'

const testParseTable = [
  ["- [ ] task title", "task title", "", false],
  ["- [x] task title", "task title", "", true],
  ["- [ ] tasktitle ~2h", "tasktitle", "2h", false],
  ["- [ ] task title ~30m #sp:1", "task title", "30m", false],
]

describe.each(testParseTable)(`parse %s`, (str: string, title: string, time: string, state: boolean) => {

  test(`returns ${title} ${time}`, () => {
    const task = Task.parse(str)
    expect(task.title).toBe(title)
    expect(task.actualTimes.toString()).toBe(time)
    expect(task.isComplete()).toBe(state)
  })

})
