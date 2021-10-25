import Log from '@/services/log'
import { Time }from '@/models/time'

const TASK_STATE = {
  STOP: "STOP",
  RUNNING: "RUNNING",
  COMPLETE: "COMPLETE",
}

type TaskState = typeof TASK_STATE[keyof typeof TASK_STATE]

export class TaskItem {
  // for unique Id
  public static taskId = 0

  // utility for creating unique Id
  static getId(): number {
    this.taskId++
    return this.taskId
  }

  public static parse(taskStr: string): TaskItem {
    const taskRegexp = /- (\[\s\]|\[x\])\s.+$/
    if (taskRegexp.test(taskStr)) {
      const title = TaskItem.parseTitle(taskStr)
      const time = TaskItem.parseTime(taskStr)
      return new TaskItem(title, time);
    }

    Log.w("Can't find taskitem")
    return null;
  }

  private static parseTitle(taskStr: string): string {
     const titleRegexp = /\[.\]\s(.+?)($|\s~|\s#)/
    if (titleRegexp.test(taskStr)) {
      const m = titleRegexp.exec(taskStr);
      return m[1]
    }
    Log.w("Can't find title")
    return ""
  }

  private static parseTime(taskStr: string): Time {
    const timeRegexp = /~((\d+d)?(\d+h)?(\d+m)?)/
    if (timeRegexp.test(taskStr)) {
      const m = timeRegexp.exec(taskStr)
      if (m[1]) {
        return Time.parseStr(m[1]);
      }
    }
    Log.w(`can't find time: ${taskStr}`)
    return new Time();
  }

  public id: number
  public title: string
  public taskState: TaskState
  public estimatedTimes: Time
  public actualTimes: Time

  /** millis */
  private trackingStartTime: number;

  constructor(title: string, time: Time) {
    this.id = TaskItem.getId()
    this.title = title
    this.taskState = TASK_STATE.STOP
    this.trackingStartTime = 0;
    this.actualTimes = time
  }

  trackingStart(): void {
    this.trackingStartTime = Date.now()
    this.taskState = TASK_STATE.RUNNING
  }

  trackingEnd(): void {
    const elapsedTimeMs = Date.now() - this.trackingStartTime
    const elapsedTime = Time.parseMs(elapsedTimeMs)
    this.actualTimes.add(elapsedTime)
    this.taskState = TASK_STATE.STOP
    this.trackingStartTime = 0
  }

  get isComplete(): boolean {
    return this.taskState === TASK_STATE.COMPLETE
  }
}

