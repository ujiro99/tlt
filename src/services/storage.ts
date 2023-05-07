import Log from '@/services/log'

// for debug
// void chrome.storage.local.clear()

export const STORAGE_KEY = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_TYPE: 'token_type',
  CALENDAR_DOWNLOAD: 'calendar_download',
  CALENDAR_UPLOAD: 'calendar_upload',
  CALENDAR_COLOR: 'calendar_color',
  CALENDAR_EVENT: 'calendar_event',
  OAUTH_STATE: 'oauth_state',
  LOGIN_STATE: 'login_state',
  ICON_START_MINUTES: 'icon_start_minutes',
  TASK_LIST_TEXT: 'task_list_text',
  TASK_TAGS: 'task_tags',
  TRACKING_START_MS: 'tracking_start_ms',
  TRACKING_STATE: 'tracking_state',
  ACTIVITIES: 'activities',
  ALARMS: 'alarms',
  NOTIFICATION_EVENT: 'notification_event',
} as const
export type StorageKey = (typeof STORAGE_KEY)[keyof typeof STORAGE_KEY]

export const ACCOUNT_DATA = [
  STORAGE_KEY.ACCESS_TOKEN,
  STORAGE_KEY.REFRESH_TOKEN,
  STORAGE_KEY.TOKEN_TYPE,
  STORAGE_KEY.CALENDAR_DOWNLOAD,
  STORAGE_KEY.CALENDAR_UPLOAD,
  STORAGE_KEY.CALENDAR_COLOR,
  STORAGE_KEY.CALENDAR_EVENT,
]

export const TOKEN_TYPE = {
  CHROME: 'chrome',
  WEB: 'web',
}

export const DEFAULTS = {
  [STORAGE_KEY.ACTIVITIES]: [],
  [STORAGE_KEY.ALARMS]: [],
  [STORAGE_KEY.CALENDAR_COLOR]: {},
  [STORAGE_KEY.CALENDAR_EVENT]: [],
}

type onChangedCallback = (newVal, oldVal) => void

export const Storage = {
  /**
   * Get a item from chrome local storage.
   *
   * @param {StorageKey} key of item in storage.
   */
  get: (key: StorageKey): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, function (result) {
        Log.d('storage get: ' + key)
        if (chrome.runtime.lastError != null) {
          reject(chrome.runtime.lastError)
        } else {
          Log.v(result[key])
          resolve(result[key])
        }
      })
    })
  },

  /**
   * Set a item to chrome local storage.
   *
   * @param {string} key key of item.
   * @param {any} value item.
   */
  set: (
    key: string,
    value: unknown,
  ): Promise<boolean | chrome.runtime.LastError> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, function () {
        Log.d('storage set: ' + key)
        if (chrome.runtime.lastError != null) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(true)
        }
      })
    })
  },

  /**
   * Remove a item in chrome local storage.
   *
   * @param {string} key key of item.
   */
  remove: (key: StorageKey): Promise<boolean | chrome.runtime.LastError> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(key, function () {
        Log.d('storage remove: ' + key)
        if (chrome.runtime.lastError != null) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(true)
        }
      })
    })
  },

  /**
   * Clear all items in chrome local storage.
   */
  clear: (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(function () {
        Log.d('clear')
        if (chrome.runtime.lastError != null) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(true)
        }
      })
    })
  },

  addListener: (key: StorageKey, cb: onChangedCallback) => {
    chrome.storage.onChanged.addListener((changes) => {
      for (let [k, { oldValue, newValue }] of Object.entries(changes)) {
        if (k === key) cb(newValue, oldValue)
      }
    })
  },
}
