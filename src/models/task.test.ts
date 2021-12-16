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

const testParseIndent = [
  ["- [ ] task title", 0],
  ["    - [x] task title", 4],
  ["        - [ ] tasktitle ~2h", 8],
  ["            - [ ] task title ~30m #sp:1", 12],
]

describe.each(testParseIndent)(`parse indent %s`, (str: string, indent:number) => {
  test(`returns ${indent}`, () => {
    const task = Task.parse(str)
    expect(task.indent).toBe(indent)
  })
})

describe('trackingStart', () => {
  test('changes its state', () => {
    const task = Task.parse("- [ ] task title")
    expect(task.isRunning()).toBe(false)
    task.trackingStart()
    expect(task.isRunning()).toBe(true)
  });
  test('returns current time', () => {
    const task = Task.parse("- [ ] task title")
    expect(task.isRunning()).toBe(false)
    const now = task.trackingStart()
    expect(now > 0).toBe(true)
  });
})

describe('trackingStop', () => {
  test('changes its state', () => {
    const task = Task.parse("- [ ] task title")
    const now = task.trackingStart()
    expect(task.isRunning()).toBe(true)
    task.trackingStop(now)
    expect(task.isRunning()).toBe(false)
  })

  test('updates actual times: 1 minutes', () => {
    const task = Task.parse("- [ ] task title")
    const now = task.trackingStart()
    task.trackingStop(now - 60 * 1000)
    expect(task.actualTimes.minutes).toBe(1)
  })

  test('updates actual times: 1hours, 1 minutes', () => {
    const task = Task.parse("- [ ] task title")
    const now = task.trackingStart()
    task.trackingStop(now - (60 * 60 * 1000 + 60 * 1000))
    expect(task.actualTimes.minutes).toBe(1)
    expect(task.actualTimes.hours).toBe(1)
  })
})
