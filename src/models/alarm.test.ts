import { Alarm, ALARM_TYPE } from './alarm'

describe('constructor', () => {
  test('minutes', () => {
    const alarm = new Alarm({
      type: ALARM_TYPE.TASK,
      name: 'test',
      message: 'test message',
      minutes: 1,
    })
    expect(alarm.name).toBe('test')
    expect(alarm.message).toBe('test message')
    expect(alarm.scheduledTime).toBeGreaterThan(0)
  })

  test('when', () => {
    const alarm = new Alarm({
      type: ALARM_TYPE.EVENT,
      name: 'test',
      message: 'test message',
      when: 1,
    })
    expect(alarm.name).toBe('test')
    expect(alarm.message).toBe('test message')
    expect(alarm.scheduledTime).toBeGreaterThan(0)
  })
})

describe('toString', () => {
  test('minutes', () => {
    const obj = {
      type: ALARM_TYPE.TASK,
      name: 'test',
      message: 'test message',
      minutes: 1,
    }
    const alarm = new Alarm(obj)
    expect(alarm.toString()).toMatch("{\"type\":\"TASK\",\"name\":\"test\",\"message\":\"test message\",\"time\":")
  })

  test('when', () => {
    const now = Date.now()
    const obj = {
      type: ALARM_TYPE.EVENT,
      name: 'test',
      message: 'test message',
      when: now,
    }
    const alarm = new Alarm(obj)
    expect(alarm.toString()).toMatch("{\"type\":\"EVENT\",\"name\":\"test\",\"message\":\"test message\",\"time\":" + now)
  })
})

describe('fromString', () => {
  test('minutes', () => {
    const obj = {
      type: ALARM_TYPE.TASK,
      name: 'test',
      message: 'test message',
      minutes: 1,
    }
    const alarm = new Alarm(obj)
    const parsed = Alarm.fromString(alarm.toString())
    expect(parsed.name).toBe('test')
    expect(parsed.message).toBe('test message')
    expect(parsed.scheduledTime).toBeGreaterThan(0)
  })

  test('when', () => {
    const now = Date.now()
    const obj = {
      type: ALARM_TYPE.EVENT,
      name: 'test',
      message: 'test message',
      when: now,
    }
    const alarm = new Alarm(obj)
    const parsed = Alarm.fromString(alarm.toString())
    expect(parsed.name).toBe('test')
    expect(parsed.message).toBe('test message')
    expect(parsed.scheduledTime).toBe(now)
  })
})