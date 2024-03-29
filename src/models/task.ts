import Log from '@/services/log'
import { Tag } from '@/models/tag'
import { Time } from '@/models/time'
import { IClonable } from '@/@types/global'

/**
 * Represent the status of the Task.
 */
const TASK_STATE = {
  STOP: 'STOP',
  RUNNING: 'RUNNING',
  COMPLETE: 'COMPLETE',
}
type TaskState = (typeof TASK_STATE)[keyof typeof TASK_STATE]

export class Task implements IClonable<Task> {
  // for unique Id
  private static taskId = 0

  // Regular expressions for markdown parsing
  private static taskRegexp = /- (\[\s\]|\[x\])\s.*$/
  private static emptyTaskRegexp = /- (\[\s\]|\[x\]) /
  private static stateRegexp = /(\[ \]|\[x\])/
  private static titleRegexp = /\[.\]\s(.+?)(?:$|\s~|\s#(\d*))/
  private static timeRegexp = /~((\d+(?:\.\d+)?d)?(\d+(?:\.\d+)?h)?(\d+m)?)/
  private static estimatedTimeRegexp =
    /~(\d+(?:\.\d+)?[dhm])*\/((\d+(?:\.\d+)?d)?(\d+(?:\.\d+)?h)?(\d+m)?)/
  private static tagRegexp = /#(\S+?)(:(\d))?(\s|$)/g
  private static allNumberRegexp = /^\d+$/

  // utility for creating unique Id
  static getId(): number {
    this.taskId++
    return this.taskId
  }

  public static test(taskStr: string): boolean {
    return Task.taskRegexp.test(taskStr)
  }

  public static isEmptyTask(taskStr: string): boolean {
    if (!Task.emptyTaskRegexp.test(taskStr)) {
      return false
    }
    return /^\s*$/.test(taskStr.replace(Task.emptyTaskRegexp, ''))
  }

  public static parse(taskStr: string): Task {
    if (Task.test(taskStr)) {
      const state = Task.parseState(taskStr)
      const title = Task.parseTitle(taskStr)
      const atime = Task.parseTime(taskStr)
      const etime = Task.parseEstimatedTime(taskStr)
      const tags = Task.parseTags(taskStr)
      return new Task(state, title, atime, etime, tags)
    }
    Log.v("Can't find task: " + taskStr)
    return null
  }

  private static parseState(taskStr: string): TaskState {
    if (Task.stateRegexp.test(taskStr)) {
      const m = Task.stateRegexp.exec(taskStr)
      if (m[0] === '[ ]') {
        return TASK_STATE.STOP
      } else {
        return TASK_STATE.COMPLETE
      }
    }
    Log.w("Can't find state")
    return TASK_STATE.STOP
  }

  private static parseTitle(taskStr: string): string {
    if (Task.titleRegexp.test(taskStr)) {
      const m = Task.titleRegexp.exec(taskStr)
      if (m[2]) return `${m[1]} #${m[2]}`
      return m[1]
    }
    return ''
  }

  private static parseTime(taskStr: string): Time {
    if (Task.timeRegexp.test(taskStr)) {
      const m = Task.timeRegexp.exec(taskStr)
      if (m[1]) {
        return Time.parseStr(m[1])
      }
    }
    Log.v(`can't find time: ${taskStr}`)
    return new Time()
  }

  private static parseEstimatedTime(taskStr: string): Time {
    if (Task.estimatedTimeRegexp.test(taskStr)) {
      const m = Task.estimatedTimeRegexp.exec(taskStr)
      if (m[2]) {
        return Time.parseStr(m[2])
      }
    }
    Log.v(`can't find estimated time: ${taskStr}`)
    return new Time()
  }

  public static parseTags(taskStr: string): Tag[] {
    const tags: Tag[] = []
    let match: RegExpExecArray
    while ((match = Task.tagRegexp.exec(taskStr)) !== null) {
      if (Task.allNumberRegexp.test(match[1])) {
        // The number with "#" is not treated as a tag.
        continue
      }
      const quantity = match[3] ? parseInt(match[3]) : 0
      tags.push({ name: match[1], quantity })
    }
    return tags
  }

  public id: number
  public title: string
  public taskState: TaskState
  public estimatedTimes: Time
  public actualTimes: Time
  public tags: Tag[]
  public calendarEventId: string

  /**
   * Constructor called only by the parse function.
   */
  private constructor(
    state: TaskState,
    title: string,
    actualTimes: Time,
    estimatedTimes?: Time,
    tags?: Tag[],
  ) {
    this.id = Task.getId()
    this.title = title
    this.taskState = state
    this.actualTimes = actualTimes
    this.estimatedTimes = estimatedTimes || new Time()
    this.tags = tags || []
  }

  /**
   * Start tracking.
   *
   * @returns {number} Time when tracking started in millisconds.
   */
  public trackingStart(): number {
    Log.d('trackingStart: ' + this.title)
    this.taskState = TASK_STATE.RUNNING
    return Date.now()
  }

  /**
   * Stop tracking.
   * @param {number} trackingStartTime Time when tracking started in millisconds.
   */
  public trackingStop(trackingStartTime: number): void {
    Log.d('trackingStop: ' + this.title)
    if (isNaN(trackingStartTime)) {
      Log.e('invalid trackingStartTime')
    }
    const elapsedTimeMs = Date.now() - trackingStartTime
    const elapsedTime = Time.parseMs(elapsedTimeMs)
    this.actualTimes.add(elapsedTime)
    this.taskState = TASK_STATE.STOP
  }

  public setComplete(isComplete: boolean): void {
    if (isComplete) {
      this.taskState = TASK_STATE.COMPLETE

      if (this.actualTimes.isEmpty() && !this.estimatedTimes.isEmpty()) {
        this.actualTimes.add(this.estimatedTimes)
      }
    } else {
      if (this.taskState !== TASK_STATE.RUNNING) {
        this.taskState = TASK_STATE.STOP
      }
    }
  }

  public toString(): string {
    let str = `- [ ] ${this.title}`
    // state
    if (this.isComplete()) {
      str = str.replace('[ ]', '[x]')
    }
    // actual time
    const isActualTimesEmpty = this.actualTimes.isEmpty()
    if (!isActualTimesEmpty) {
      const time = this.actualTimes.toString()
      str += ` ~${time}`
    }
    // estimated time
    if (!this.estimatedTimes.isEmpty()) {
      const time = this.estimatedTimes.toString()
      if (isActualTimesEmpty) {
        str += ` ~/${time}`
      } else {
        str += `/${time}`
      }
    }
    // tags
    if (this.tags.length > 0) {
      const tagStr = this.tags
        .map((t) => (t.quantity ? `#${t.name}:${t.quantity}` : `#${t.name}`))
        .join(' ')
      str += ` ${tagStr}`
    }
    return str
  }

  public isComplete(): boolean {
    return this.taskState === TASK_STATE.COMPLETE
  }

  public isRunning(): boolean {
    return this.taskState === TASK_STATE.RUNNING
  }

  public clone(): Task {
    const newTask = new Task(this.taskState, this.title, this.actualTimes)
    newTask.id = this.id
    newTask.estimatedTimes = this.estimatedTimes.clone()
    newTask.actualTimes = this.actualTimes.clone()
    newTask.tags = this.tags
    newTask.calendarEventId = this.calendarEventId
    return newTask
  }
}
