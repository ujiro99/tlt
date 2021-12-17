import Log from '@/services/log'
import { Icon } from '@/services/icon'
import { Storage, STORAGE_KEY } from '@/services/storage'

/** Alarm name */
const TIMER_NAME = 'ICON_TIMER'

/** Hour in minutes */
const HOUR = 60

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

    // save state to storage
    void Storage.set(STORAGE_KEY.ICON_START_MINUTES, startMinutes)
    void Storage.set(STORAGE_KEY.TRACKING_START_MS, Date.now())

    // start timer
    chrome.alarms.create(TIMER_NAME, { periodInMinutes: 1 })
    return true
  },

  /**
   * Stop tracking, and clear badge text.
   */
  stopTracking() {
    void chrome.alarms.clear(TIMER_NAME)
    Icon.clearText()
    return true
  },
}

/**
 * Display an icon using the saved time information.
 */
async function updateIconTime() {
  const trackingStartTime = (await Storage.get(
    STORAGE_KEY.TRACKING_START_MS,
  )) as number
  const startMinutes = (await Storage.get(
    STORAGE_KEY.ICON_START_MINUTES,
  )) as number
  const elapsedMs = Date.now() - trackingStartTime
  const elapsedMin = Math.floor(elapsedMs / (60 * 1000))
  const time = (startMinutes + elapsedMin) % HOUR
  Icon.setText(`${time}m`)
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== TIMER_NAME) return
  void updateIconTime()
})
