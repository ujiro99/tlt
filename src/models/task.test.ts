import { Task } from '@/models/task'

const testParseTable = [
  ['- [ ] task title',                 'task title', '',        false],
  ['- [x] task title',                 'task title', '',        true],
  ['- [ ] task title ~2h',             'task title', '2h',      false],
  ['- [ ] task title ~1m',             'task title', '1m',      false],
  ['- [ ] task title ~2.1h',           'task title', '2h6m',    false],
  ['- [ ] task title ~2.1h4m',         'task title', '2h10m',   false],
  ['- [ ] task title ~0.1d1h1m',       'task title', '3h25m',   false],
  ['- [ ] task title ~1.1d1h1m',       'task title', '1d3h25m', false],
  ['- [ ] task title ~30m #sp:1',      'task title', '30m',     false],
  ['- [ ] task title ~30m/2.3h #sp:1', 'task title', '30m',     false],
]

describe.each(testParseTable)(
  `parse %s`,
  (str: string, title: string, atime: string, state: boolean) => {
    test(`returns ${title} ${atime}`, () => {
      const task = Task.parse(str)
      expect(task.title).toBe(title)
      expect(task.actualTimes.toString()).toBe(atime)
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

const parseTimeTable = [
  ['- [ ] task ~30m/1h',          '30m',    '1h'],
  ['- [ ] task ~1h13m/1h30m #cd', '1h13m',  '1h30m'],
  ['- [ ] task ~/30m #cd',        '',       '30m'],
  ['- [ ] task ~/1h',             '',       '1h'],
  ['- [ ] task ~/1d',             '',       '1d'],
  ['- [ ] task ~/10d',            '',       '10d'],
  ['- [ ] task ~1d',              '1d',     ''],
  ['- [ ] task ~1d1h',            '1d1h',   ''],
  ['- [ ] task ~1d1h1m',          '1d1h1m', ''],
  ['- [ ] task ~1d1m',            '1d1m',   ''],
  ['- [ ] task ~1h',              '1h',     ''],
  ['- [ ] task ~1h1m',            '1h1m',   ''],
  ['- [ ] task ~1m',              '1m',     ''],
  ['- [ ] task ~1d/1d',           '1d',     '1d'],
  ['- [ ] task ~1d1h/1d1h',       '1d1h',   '1d1h'],
  ['- [ ] task ~1d1h1m/1d1h1m',   '1d1h1m', '1d1h1m'],
  ['- [ ] task ~1d1m/1d1m',       '1d1m',   '1d1m'],
  ['- [ ] task ~0.5d/0.5d',       '12h',    '12h'],
  ['- [ ] task ~1h/1h',           '1h',     '1h'],
  ['- [ ] task ~1h1m/1h10m',      '1h1m',   '1h10m'],
  ['- [ ] task ~1m/1m',           '1m',     '1m'],
  ['- [ ] task ~0.1h/1h',         '6m',     '1h'],
  ['- [ ] task ~0.25h/1h',        '15m',    '1h'],
  ['- [ ] task ~0.125h/1h',       '7m',     '1h'],
  ['- [ ] task ~0.1h/0.1h',       '6m',     '6m'],
]

describe.each(parseTimeTable)(
  `parse %s`,
  (str: string, atime: string, etime: string) => {
    test(`returns ${atime}/${etime}`, () => {
      const task = Task.parse(str)
      expect(task.actualTimes.toString()).toBe(atime)
      expect(task.estimatedTimes.toString()).toBe(etime)
    })
  },
)

describe(`parse estimatedTimes`, () => {
  test(`returns 1h`, () => {
    const str = '- [ ] task title ~30m/1h'
    const task = Task.parse(str)
    expect(task.estimatedTimes.toString()).toBe('1h')
  })

})

describe(`parse tags`, () => {
  test(`returns sp:1`, () => {
    const str = '- [ ] task title ~30m/1h #sp'
    const task = Task.parse(str)
    expect(task.tags[0].name).toBe('sp')
    expect(task.tags[0].quantity).toBe(0)
  })

  test(`returns sp:1 and review`, () => {
    const str = '- [ ] task title ~30m/1h #sp:4 #review'
    const task = Task.parse(str)
    expect(task.tags[0].name).toBe('sp')
    expect(task.tags[0].quantity).toBe(4)
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
