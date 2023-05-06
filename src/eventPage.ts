import Log from '@/services/log'
import { Icon } from '@/services/icon'
import { Storage, STORAGE_KEY } from '@/services/storage'
import { Alarm, ALARM_TYPE } from '@/models/alarm'

/** ICON ALarm **/
const ICON_ALARM = new Alarm({
  type: ALARM_TYPE.ICON,
  name: 'icon',
  message: '',
}).toString()

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
    chrome.alarms.create(ICON_ALARM, { periodInMinutes: 1 })
    return true
  },

  /**
   * Stop tracking, and clear badge text.
   */
  stopTracking() {
    void chrome.alarms.clear(ICON_ALARM)
    Icon.clearText()
    return true
  },

  setAlarm(param: Alarm, sendResponse: () => void) {
    const alarm = new Alarm({
      type: param.type,
      name: param.name,
      message: param.message,
      when: param.scheduledTime,
    })
    alarm.type = param.type
    chrome.alarms.create(alarm.toString(), {
      when: param.scheduledTime,
    })
    sendResponse()
    return true
  },

  stopAlarmsForTask(_, sendResponse: () => void) {
    chrome.alarms.getAll((alarms) => {
      const promises = Object.values(alarms).map((alarm) => {
        const obj = Alarm.fromString(alarm.name)
        if (obj.type === ALARM_TYPE.TASK) {
          Log.d(`clear alarm: ${obj.name} | ${obj.message}`)
          return chrome.alarms.clear(alarm.name)
        }
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
  const obj = Alarm.fromString(alarm.name)
  Log.d(obj.type + ' ' + obj.name)

  if (obj.type === ALARM_TYPE.ICON) {
    void updateIconTime()
  } else if (obj.type === ALARM_TYPE.TASK) {
    chrome.notifications.create({
      type: 'basic',
      title: obj.message,
      message: obj.name,
      iconUrl: '/icon128.png',
    })
  } else if (obj.type === ALARM_TYPE.EVENT) {
    chrome.notifications.create({
      type: 'basic',
      title: obj.message,
      message: obj.name,
      iconUrl: '/icon128.png',
      buttons: [{ title: 'start tracking' }],
    })
  }
})

chrome.notifications.onButtonClicked.addListener(
  (notificationId, buttonIndex) => {
    console.log(notificationId, buttonIndex)
  },
)

chrome.notifications.onClicked.addListener((notificationId) => {
  console.log(notificationId)
})
