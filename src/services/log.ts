/**
 * Do not usually display.
 */
const verbose = false

/**
 * Setting value to switch the debug log output from this module.
 * true: enables all log. | false: disables debug log.
 */
const environment = process.env.NODE_ENV || 'development'
const isDebug = environment === 'development'

interface ILog {
  v: (msg: unknown) => void
  d: (msg: unknown) => void
  w: (msg: unknown) => void
  e: (msg: unknown) => void
}

const nop = () => {
  /* nothing to do */
}

/**
 * Log module.
 */
const Log: ILog = {
  /**
   * Output verbose level log.
   */
  v: verbose ? console.log : nop,
  /**
   * Output debug level log.
   */
  d: isDebug ? console.debug : nop,
  /**
   * Output warning level log.
   */
  w: console.warn.bind(console) as (msg: string) => void,
  /**
   * Output error level log.
   */
  e: console.error.bind(console) as (msg: string) => void,
}

export default Log
