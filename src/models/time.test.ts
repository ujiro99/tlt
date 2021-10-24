import { Time } from "@/models/time"

const SECOND_MS = 1000
const MINUTE_MS = 60 * SECOND_MS
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

describe('parse number to time', () => {
  test('60 * 1000 [ms] -> "1m"', () => {
    const time = Time.parseMs(MINUTE_MS)
    expect(time.toString()).toBe("1m")
  });

  test('2 * 60 * 1000 [ms] -> "2m"', () => {
    const time = Time.parseMs(2 * MINUTE_MS)
    expect(time.toString()).toBe("2m")
  });

  test('60 * 60 * 1000 [ms] -> "1h"', () => {
    const time = Time.parseMs(HOUR_MS)
    expect(time.toString()).toBe("1h")
  });

  test('60 * 60 * 1000 + 60 * 1000 [ms] -> "1h1m"', () => {
    const time = Time.parseMs(HOUR_MS + MINUTE_MS)
    expect(time.toString()).toBe("1h1m")
  });

  test('24 * 60 * 60 * 1000 [ms] -> "1d"', () => {
    const time = Time.parseMs(DAY_MS)
    expect(time.toString()).toBe("1d")
  });
})

describe('parse string to time', () => {
  test('"1m" -> 1 minutes', () => {
    const time = Time.parseStr("1m");
    expect(time.minutes).toBe(1)
    expect(time.hours).toBe(0)
    expect(time.days).toBe(0)
  })

  test('"1h" -> 1 hours', () => {
    const time = Time.parseStr("1h");
    expect(time.minutes).toBe(0)
    expect(time.hours).toBe(1)
    expect(time.days).toBe(0)
  })

  test('"1d" -> 1 days', () => {
    const time = Time.parseStr("1d");
    expect(time.minutes).toBe(0)
    expect(time.hours).toBe(0)
    expect(time.days).toBe(1)
  })

  test('"2d" -> 2 days', () => {
    const time = Time.parseStr("2d");
    expect(time.minutes).toBe(0)
    expect(time.hours).toBe(0)
    expect(time.days).toBe(2)
  })

  test('"1d1m" -> 1 days and 1 minutes', () => {
    const time = Time.parseStr("1d1m");
    expect(time.minutes).toBe(1)
    expect(time.hours).toBe(0)
    expect(time.days).toBe(1)
  })

  test('"1x" (invalid format) -> 0', () => {
    const time = Time.parseStr("1x");
    expect(time.minutes).toBe(0)
    expect(time.hours).toBe(0)
    expect(time.days).toBe(0)
  })

  test('"1 m" (invalid format) -> 0', () => {
    const time = Time.parseStr("1 x");
    expect(time.minutes).toBe(0)
    expect(time.hours).toBe(0)
    expect(time.days).toBe(0)
  })
})

describe('add', () => {
  test('1m + 1m -> 2m', () => {
    const time = Time.parseStr("1m");
    const timeB = Time.parseStr("1m");
    time.add(timeB)
    expect(time.minutes).toBe(2)
    expect(time.hours).toBe(0)
    expect(time.days).toBe(0)
  })

  test('1m + 1h -> 1h 1m', () => {
    const time = Time.parseStr("1m");
    const timeB = Time.parseStr("1h");
    time.add(timeB)
    expect(time.minutes).toBe(1)
    expect(time.hours).toBe(1)
    expect(time.days).toBe(0)
  })

  test('1d + 1h -> 1d 1h', () => {
    const time = Time.parseStr("1d");
    const timeB = Time.parseStr("1h");
    time.add(timeB)
    expect(time.minutes).toBe(0)
    expect(time.hours).toBe(1)
    expect(time.days).toBe(1)
  })

})
