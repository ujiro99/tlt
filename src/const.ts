export const DEFAULT = '- [ ] '
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
export const CLIENT_ID_WEB = '577324617872-233r38j2ivo2vfjhukbfgav954hm3ugv.apps.googleusercontent.com'
export const CLIENT_SECLET = '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'

// for api
export const API_KEY = 'AIzaSyBK5S_Av3w0HloD8Q5u13jSqZmCHIrW-Z8'

/**
 * Setting value to switch the debug log output from this module.
 * true: enables all log. | false: disables debug log.
 */
const environment = process.env.NODE_ENV || 'development'
export const isDebug = environment === 'development'
