import { chrome } from 'jest-chrome'
import { format } from 'date-fns'
import { Task } from '@/models/task'
import { AlarmService } from './alarmService' 
import { AlarmRule, ALARM_ANCHOR, ALARM_TIMING } from '@/models/alarmRule'

const TIME_FMT = 'HH:mm'

describe('taskToAlarms', () => {
  test('after start time', () => {
    const task = Task.parse("- [ ] task ~/1h")
    const minutes = 5
    const rule = new AlarmRule(ALARM_TIMING.AFTER, ALARM_ANCHOR.START, minutes)
    const alarms = AlarmService.taskToAlarms(task, [rule])
    const alarm = alarms[0]

    expect(alarm.time).toBe(format(Date.now() + minutes * 60 * 1000, TIME_FMT))
  })

  test('after scheduled time', () => {
    const task = Task.parse("- [ ] task ~/1h")
    const minutes = 5
    const rule = new AlarmRule(ALARM_TIMING.AFTER, ALARM_ANCHOR.SCEHEDULED, minutes)
    const alarms = AlarmService.taskToAlarms(task, [rule])
    const alarm = alarms[0]

    expect(alarm.time).toBe(format(Date.now() + (60 + minutes) * 60 * 1000, TIME_FMT))
  })
    
  test('before scheduled time', () => {
    const task = Task.parse("- [ ] task ~/1h")
    const minutes = 5
    const rule = new AlarmRule(ALARM_TIMING.BEFORE, ALARM_ANCHOR.SCEHEDULED, minutes)
    const alarms = AlarmService.taskToAlarms(task, [rule])
    const alarm = alarms[0]

    expect(alarm.time).toBe(format(Date.now() + (60 - minutes) * 60 * 1000, TIME_FMT))
  })
})