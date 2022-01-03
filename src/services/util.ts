/**
 * Stops processing for the specified time.
 * @param {number} msec Sleep time in millisconds
 */
export function sleep(msec: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, msec))
}

/**
 * Convert indent width to margin.
 * @param {number} Number of indent spaces
 * @return margin left.
 */
export function indentToMargin(indent: number): string {
  return `${indent / 4}em`
}
