import { Task } from '@/models/task'

const testParseTable = [
  ['- [ ] task title', 'task title', '', false],
  ['- [x] task title', 'task title', '', true],
  ['- [ ] tasktitle ~2h', 'tasktitle', '2h', false],
  ['- [ ] tasktitle ~1m', 'tasktitle', '1m', false],
  ['- [ ] tasktitle ~2.1h', 'tasktitle', '2h6m', false],
  ['- [ ] tasktitle ~2.1h4m', 'tasktitle', '2h10m', false],
  ['- [ ] tasktitle ~0.1d1h1m', 'tasktitle', '3h25m', false],
  ['- [ ] tasktitle ~1.1d1h1m', 'tasktitle', '1d3h25m', false],
  ['- [ ] task title ~30m #sp:1', 'task title', '30m', false],
  ['- [ ] task title ~30m/2.3h #sp:1', 'task title', '30m', false],
]

describe.each(testParseTable)(
  `parse %s`,
  (str: string, title: string, time: string, state: boolean) => {
    test(`returns ${title} ${time}`, () => {
      const task = Task.parse(str)
      expect(task.title).toBe(title)
      expect(task.actualTimes.toString()).toBe(time)
      expect(task.isComplete()).toBe(state)
    })
  },
)

describe(`toString`, () => {
  test(`returns same string`, () => {
    const str = '- [ ] task title ~30m/2h15m #sp:1'
    const task = Task.parse(str)
    expect(task.toString()).toBe(str)
  })

  test(`returns same string when the actualTimes doesn't exists.`, () => {
    const str = '- [ ] task title ~/1m #sp:1'
    const task = Task.parse(str)
    expect(task.toString()).toBe(str)
  })
})

describe(`parse estimatedTimes`, () => {
  test(`returns 1h`, () => {
    const str = '- [ ] task title ~30m/1h'
    const task = Task.parse(str)
    expect(task.estimatedTimes.toString()).toBe('1h')
  })

  test(`returns 1h30m`, () => {
    const str = '- [ ] task ~1h13m/1h30m #cd'
    const task = Task.parse(str)
    expect(task.estimatedTimes.toString()).toBe('1h30m')
  })

  test(`returns 30m`, () => {
    const str = '- [ ] task ~/30m #cd'
    const task = Task.parse(str)
    expect(task.estimatedTimes.toString()).toBe('30m')
  })

})

describe(`parse tags`, () => {
  test(`returns sp:1`, () => {
    const str = '- [ ] task title ~30m/1h #sp:1'
    const task = Task.parse(str)
    expect(task.tags[0].name).toBe('sp:1')
  })

  test(`returns sp:1 and review`, () => {
    const str = '- [ ] task title ~30m/1h #sp:1 #review'
    const task = Task.parse(str)
    expect(task.tags[0].name).toBe('sp:1')
    expect(task.tags[1].name).toBe('review')
  })

  test(`returns no tags`, () => {
    const str = '- [ ] task title'
    const task = Task.parse(str)
    expect(task.tags.length).toBe(0)
  })
})

describe('trackingStart', () => {
  test('changes its state', () => {
    const task = Task.parse('- [ ] task title')
    expect(task.isRunning()).toBe(false)
    task.trackingStart()
    expect(task.isRunning()).toBe(true)
  })
  test('returns current time', () => {
    const task = Task.parse('- [ ] task title')
    expect(task.isRunning()).toBe(false)
    const now = task.trackingStart()
    expect(now > 0).toBe(true)
  })
})

describe('trackingStop', () => {
  test('changes its state', () => {
    const task = Task.parse('- [ ] task title')
    const now = task.trackingStart()
    expect(task.isRunning()).toBe(true)
    task.trackingStop(now)
    expect(task.isRunning()).toBe(false)
  })

  test('updates actual times: 1 minutes', () => {
    const task = Task.parse('- [ ] task title')
    const now = task.trackingStart()
    task.trackingStop(now - 60 * 1000)
    expect(task.actualTimes.minutes).toBe(1)
  })

  test('updates actual times: 1hours, 1 minutes', () => {
    const task = Task.parse('- [ ] task title')
    const now = task.trackingStart()
    task.trackingStop(now - (60 * 60 * 1000 + 60 * 1000))
    expect(task.actualTimes.minutes).toBe(1)
    expect(task.actualTimes.hours).toBe(1)
  })
})
