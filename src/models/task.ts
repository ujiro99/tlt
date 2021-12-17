import Log from '@/services/log'
import { Time } from '@/models/time'

/**
 * Represent the status of the Task.
 */
const TASK_STATE = {
  STOP: 'STOP',
  RUNNING: 'RUNNING',
  COMPLETE: 'COMPLETE',
}
type TaskState = typeof TASK_STATE[keyof typeof TASK_STATE]

export class Task {
  // for unique Id
  private static taskId = 0

  // Regular expressions for markdown parsing
  private static taskRegexp = /- (\[\s\]|\[x\])\s.+$/
  private static indentRegexp = /^ +/
  private static stateRegexp = /(\[ \]|\[x\])/
  private static titleRegexp = /\[.\]\s(.+?)($|\s~|\s#)/
  private static timeRegexp = /~((\d+d)?(\d+h)?(\d+m)?)/

  // utility for creating unique Id
  static getId(): number {
    this.taskId++
    return this.taskId
  }

  public static isTaskStr(taskStr: string): boolean {
    return Task.taskRegexp.test(taskStr)
  }

  public static parse(taskStr: string): Task {
    if (Task.isTaskStr(taskStr)) {
      const indent = Task.parseIndent(taskStr)
      const state = Task.parseState(taskStr)
      const title = Task.parseTitle(taskStr)
      const time = Task.parseTime(taskStr)
      return new Task(state, title, time, indent)
    }
    Log.v("Can't find task: " + taskStr)
    return null
  }

  private static parseIndent(taskStr: string): number {
    if (Task.indentRegexp.test(taskStr)) {
      const m = Task.indentRegexp.exec(taskStr)
      return m[0].length
    }
    return 0
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
      return m[1]
    }
    Log.w("Can't find title")
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

  public id: number
  public title: string
  public taskState: TaskState
  public estimatedTimes: Time
  public actualTimes: Time

  private _indent: number

  /**
   * Constructor called only by the parse function.
   */
  private constructor(state: TaskState, title: string, time: Time, indent: number) {
    this.id = Task.getId()
    this.title = title
    this.taskState = state
    this.actualTimes = time
    this._indent = indent
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
    } else {
      if (this.taskState !== TASK_STATE.RUNNING) {
        this.taskState = TASK_STATE.STOP
      }
    }
  }

  public toString(): string {
    const indent = ''.padStart(this._indent, ' ')
    let str = `${indent}- [ ] ${this.title}`
    // state
    if (this.isComplete()) {
      str = str.replace('[ ]', '[x]')
    }
    // actual time
    if (!this.actualTimes.isEmpty()) {
      const time = this.actualTimes.toString()
      str += ` ~${time}`
    }
    return str
  }

  public isComplete(): boolean {
    return this.taskState === TASK_STATE.COMPLETE
  }

  public isRunning(): boolean {
    return this.taskState === TASK_STATE.RUNNING
  }

  public get indent(): number {
    return this._indent
  }
}
