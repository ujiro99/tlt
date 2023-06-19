export const TASK_DEFAULT = '- [ ] '
export const INDENT_SIZE = 2
export const KEY = {
  TAB: 'Tab',
  ENTER: 'Enter',
}
export const KEYCODE_ENTER = 13

export const COLOR = {
  Gray200: '#e2e8f0',
}

// for oAuth
export const REDIRECT_URL = 'https://todolist-timetracking.com/oauth'
export const CLIENT_ID_WEB = process.env.CLIENT_ID_WEB
export const CLIENT_SECLET = process.env.CLIENT_SECLET

// for api
export const API_KEY = process.env.API_KEY

// for mixpanel
export const MIXPANEL_TOKEN = process.env.MIXPANEL_TOKEN

/**
 * Setting value to switch the debug log output from this module.
 * true: enables all log. | false: disables debug log.
 */
const environment = process.env.NODE_ENV || 'development'
export const isDebug = environment === 'development'
