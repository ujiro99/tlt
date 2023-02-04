export const DEFAULT = '- [ ] '
export const INDENT_SIZE = 2
export const KEY = {
  TAB: 'Tab',
  ENTER: 'Enter',
}
export const KEYCODE_ENTER = 13

export const COLOR = {
  Gray200: '#e2e8f0'
}

/**
 * Setting value to switch the debug log output from this module.
 * true: enables all log. | false: disables debug log.
 */
const environment = process.env.NODE_ENV || 'development'
export const isDebug = environment === 'development'