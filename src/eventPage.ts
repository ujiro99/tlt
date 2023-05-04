import Log from '@/services/log'
import { Icon } from '@/services/icon'
import { Storage, STORAGE_KEY } from '@/services/storage'
import { ALARM_TYPE } from '@/hooks/useAlarms'

/** Hour in minutes */
const HOUR = 60

type Request = {
  command: string
  param: unknown
}

chrome.runtime.onMessage.addListener(
  (request: Request, _: chrome.runtime.MessageSender, sendResponse) => {
    // do not use async/await here !

    const command = request.command
    const param = request.param

    Log.d(`command: ${command}`)
    if (param != null) Log.d(param)

    // onMessage must return "true" if response is async.
    const func = onMessageFuncs[command]
    if (func) {
      return func(param, sendResponse)
    }
    Log.w('command not found: ' + command)

    return false
  },
)

export type AlarmParam = {
  minutes: number
  title: string
  message: string
}

type OnMessageFuncs = {
  [key: string]: (param: unknown, sendResponse: () => void) => boolean
}

const onMessageFuncs: OnMessageFuncs = {
  popupMounted() {
    Log.d('popupMounted')
    return true
  },

  code() {
    // nothting to do, here.
    return true
  },

  /**
   * Start tracking, Update badge text every minute during tracking.
   *
   * @param startMinutes {number} Elapsed time when measurement is started in minutes.
   */
  startTracking(startMinutes: number) {
    // save state to storage
    void Storage.set(STORAGE_KEY.ICON_START_MINUTES, startMinutes)
    void Storage.set(STORAGE_KEY.TRACKING_START_MS, Date.now())
    void updateIconTime()

    // start timer
    chrome.alarms.create(ALARM_TYPE.ICON, { periodInMinutes: 1 })
    return true
  },

  /**
   * Stop tracking, and clear badge text.
   */
  stopTracking() {
    void chrome.alarms.clear(ALARM_TYPE.ICON)
    Icon.clearText()
    return true
  },

  setAlarm(param: AlarmParam, sendResponse: () => void) {
    const obj = {
      name: ALARM_TYPE.NOTIFICATION,
      param,
    }
    chrome.alarms.create(JSON.stringify(obj), {
      delayInMinutes: param.minutes,
    })
    sendResponse()
    return true
  },

  stopAllAlarm(_, sendResponse: () => void) {
    chrome.notifications.getAll((notifications) => {
      Object.keys(notifications).forEach((notificationId) => {
        chrome.notifications.clear(notificationId)
      })
    })
    chrome.alarms.getAll((alarms) => {
      const promises = Object.values(alarms).map((alarm) => {
        return chrome.alarms.clear(alarm.name)
      })
      Promise.all(promises).then(() => {
        sendResponse()
      })
    })
    return true
  },
}

/**
 * Display an icon using the saved time information.
 */
async function updateIconTime() {
  Log.d('updateIconTime')
  const trackingStartTime = (await Storage.get(
    STORAGE_KEY.TRACKING_START_MS,
  )) as number

  // Extension icon shows the time from when tracking was started.
  const startMinutes = 0
  // TODO: Make the total elapsed time display optionally selectable
  // const startMinutes = (await Storage.get(
  //   STORAGE_KEY.ICON_START_MINUTES,
  // )) as number
  const elapsedMs = Date.now() - trackingStartTime
  const elapsedMin = Math.floor(elapsedMs / (60 * 1000))
  const currentMin = startMinutes + elapsedMin
  if (currentMin >= HOUR) {
    const time = currentMin / HOUR
    Icon.setText(`${time.toFixed(1)}h`)
  } else {
    Icon.setText(`${Math.floor(currentMin)}m`)
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_TYPE.ICON) {
    void updateIconTime()
  } else {
    const obj = JSON.parse(alarm.name)
    if (obj.name === ALARM_TYPE.NOTIFICATION) {
      Log.d(ALARM_TYPE.NOTIFICATION + ' ' + obj.param.title)
      chrome.notifications.create({
        type: 'basic',
        title: obj.param.message,
        message: obj.param.title,
        iconUrl: '/icon128.png',
      })
    }
  }
})
