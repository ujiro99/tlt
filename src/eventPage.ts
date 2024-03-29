import { TrackingState } from '@/@types/global'
import { selectRecord } from '@/hooks/useTaskManager'
import { stopTrackings, saveStates } from '@/hooks/useTrackingState'
import { loadRecords } from '@/hooks/useTaskStorage'
import { EventLine } from '@/hooks/useEventAlarm'
import Log from '@/services/log'
import { Icon } from '@/services/icon'
import { t } from '@/services/i18n'
import { Storage, STORAGE_KEY } from '@/services/storage'
import { AlarmService } from '@/services/alarmService'
import { Alarm, ALARM_TYPE } from '@/models/alarm'
import { TaskRecordKey } from '@/models/taskRecordKey'
import { Time } from '@/models/time'
import { NODE_TYPE } from '@/models/node'
import { Task } from '@/models/task'
import { AlarmRule } from '@/models/alarmRule'

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
      calendarEventId: param.calendarEventId,
    })

    // Delete the alarm if it already exists.
    chrome.alarms.getAll((alarms) => {
      const promises = Object.values(alarms).map((alarm) => {
        const obj = Alarm.fromString(alarm.name)
        if (
          obj.type === ALARM_TYPE.EVENT &&
          obj.calendarEventId === param.calendarEventId
        ) {
          Log.d(`clear alarm: ${obj.name} | ${obj.message}`)
          return chrome.alarms.clear(alarm.name)
        }
        return
      })
      Promise.all(promises).then(() => {
        chrome.alarms.create(alarm.toString(), {
          when: param.scheduledTime,
        })
        sendResponse()
      })
    })

    return true
  },

  stopAlarms(params: Alarm[], sendResponse: () => void) {
    const promises = params.map((param) => {
      const alarm = new Alarm({
        type: param.type,
        name: param.name,
        message: param.message,
        when: param.scheduledTime,
        calendarEventId: param.calendarEventId,
      })
      return chrome.alarms.clear(alarm.toString())
    })
    Promise.all(promises).then(() => {
      sendResponse()
    })
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

chrome.alarms.onAlarm.addListener((param) => {
  const alarm = Alarm.fromString(param.name)
  Log.d(alarm.type + ' ' + alarm.name)

  if (alarm.type === ALARM_TYPE.ICON) {
    void updateIconTime()
  } else if (alarm.type === ALARM_TYPE.TASK) {
    chrome.notifications.create({
      type: 'basic',
      title: alarm.message,
      message: alarm.name,
      iconUrl: '/icon128.png',
    })
  } else if (alarm.type === ALARM_TYPE.EVENT) {
    // If already tracking, do not display notification.
    checkEventAlreadyStarted(alarm.calendarEventId).then((isStarted) => {
      if (isStarted) {
        Log.d('event already started')
        return
      }
      chrome.notifications.create(alarm.calendarEventId, {
        type: 'basic',
        title: alarm.message,
        message: alarm.name,
        iconUrl: '/icon128.png',
        buttons: [
          { title: t('alarm_button_start') },
          { title: t('alarm_button_nothing') },
        ],
      })
    })
  }
})

const startTrackingForCalendarEvent = async (eventId: string) => {
  const trackings = (await Storage.get(
    STORAGE_KEY.TRACKING_STATE,
  )) as TrackingState[]
  const eventLines = (await Storage.get(
    STORAGE_KEY.CALENDAR_EVENT,
  )) as EventLine[]
  const key = TaskRecordKey.fromDate(new Date())

  // Find the line number to start tracking
  const line = eventLines.find((e) => e.event.id === eventId)?.line
  if (line == null) {
    // It is not a notification to CalendarEvent, so does nothing.
    Log.e('line not found')
    return
  }

  // Stop other tracking & alarms
  const records = await loadRecords()
  const root = selectRecord(key, records)
  const [newRoot, events] = stopTrackings(root, trackings)
  onMessageFuncs.stopAlarmsForTask(0, () => {})

  // Update tracking state
  onMessageFuncs.startTracking(0, () => {})
  const tracking = {
    isTracking: true,
    nodeId: null,
    trackingStartTime: Date.now(),
    key: key.toKey(),
    elapsedTime: new Time(),
    line,
  }
  saveStates(key, newRoot, [tracking], events)

  // Set alarms for task
  const alarmRules = (await Storage.get(STORAGE_KEY.ALARMS)) as AlarmRule[]
  const node = root.find((n) => n.line === line)
  if (node != null && node.type === NODE_TYPE.TASK) {
    const alarms = AlarmService.taskToAlarms(node.data as Task, alarmRules)
    alarms.forEach((alarm) => {
      onMessageFuncs.setAlarm(alarm, () => {})
    })
  }
}

const checkEventAlreadyStarted = async (eventId: string) => {
  const trackings = (await Storage.get(
    STORAGE_KEY.TRACKING_STATE,
  )) as TrackingState[]
  const eventLines = (await Storage.get(
    STORAGE_KEY.CALENDAR_EVENT,
  )) as EventLine[]

  const line = eventLines.find((e) => e.event.id === eventId)?.line
  return trackings.some((t) => t.line === line)
}

chrome.notifications.onClicked.addListener(async (evnetId) => {
  Log.d(`${evnetId}`)
  await startTrackingForCalendarEvent(evnetId)
})

chrome.notifications.onButtonClicked.addListener(
  async (evnetId, buttonIndex) => {
    Log.d(`${evnetId}, ${buttonIndex}`)
    if (buttonIndex !== 0) {
      // Do nothing button clicked.
      return
    }
    await startTrackingForCalendarEvent(evnetId)
  },
)
