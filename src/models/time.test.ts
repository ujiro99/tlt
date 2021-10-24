import { Time } from "@/models/time"

const SECOND_MS = 1000
const MINUTE_MS = 60 * SECOND_MS
// const HOUR_MS = 60 * MINUTE_MS
// const DAY_MS = 24 * HOUR_MS


describe('parseTime', () => {
  test('1000 [ms] -> "1m"', () => {
    const time = Time.parseMs(MINUTE_MS)
    expect(time.toString()).toBe("1m")
  });
})
