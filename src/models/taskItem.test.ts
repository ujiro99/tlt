import { TaskItem } from '@/models/taskItem'

describe.each([
    ["- [ ] task title", "task title", ""],
    ["- [x] task title", "task title", ""],
    ["- [ ] tasktitle ~2h", "tasktitle", "2h"],
    ["- [ ] task title ~30m #sp:1", "task title", "30m"],
  ])(`parse %s`, (str: string, title: string, time: string) => {

  test(`returns ${title} ${time}`, () => {
    const task = TaskItem.parse(str)
    expect(task.title).toBe(title)
    expect(task.actualTimes.toString()).toBe(time)
  })

})
