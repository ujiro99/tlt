import Log from '@/services/log'
import { Icon } from '@/services/icon'

type Request = {
  command: string
  param: unknown
}

chrome.runtime.onMessage.addListener((request: Request, _, sendResponse) => {
  // do not use async/await here !

  const command = request.command
  const param = request.param

  Log.d(`command: ${command}`)
  Log.d(param)

  // onMessage must return "true" if response is async.
  const func = onMessageFuncs[command]
  if (func) {
    return func(param, sendResponse)
  }
  Log.w('command not found: ' + command)

  return false
})

/** Interval time for tracking in millisconds */
const INTERVAL_MINUTE = 60 * 1000

/** Hour in minutes */
const HOUR = 60

/** interval id */
let trackingId: number

type OnMessageFuncs = {
  [key: string]: (param: unknown, sendResponse: () => void) => boolean
}

const onMessageFuncs: OnMessageFuncs = {
  popupMounted() {
    Log.d('popupMounted')
    return true
  },

  /**
   * Start tracking, Update badge text every minute during tracking.
   *
   * @param startMinutes {number} Elapsed time when measurement is started in minutes.
   */
  startTracking(startMinutes: number) {
    Icon.setText(`${startMinutes}m`)

    trackingId = setInterval(() => {
      startMinutes++
      startMinutes = startMinutes % HOUR
      Icon.setText(`${startMinutes}m`)
    }, INTERVAL_MINUTE)

    return true
  },

  /**
   * Stop tracking, and clear badge text.
   */
  stopTracking() {
    clearInterval(trackingId)
    Icon.clearText()
    return true
  },
}
