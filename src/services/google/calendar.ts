import { format } from 'date-fns-tz'
import { differenceInMinutes } from 'date-fns'
import { Time } from '@/models/time'
import { fetchWrapper } from './util'
import Log from '@/services/log'
import { DEFAULT } from '@/const'

export type Calendar = {
  id: string
  title: string
  timeZone: string
  colorId: string
}

async function fetchCalendar(): Promise<Calendar[]> {
  const url = 'https://www.googleapis.com/calendar/v3/users/me/calendarList'

  let p = new URLSearchParams()
  p.append('minAccessRole', 'writer')
  Log.v(p.toString())

  let data
  try {
    data = await fetchWrapper(url)
    if (!data) throw Error()
  } catch (err) {
    if (err && err.message === '403') {
      return null
    }
    Log.w('fetch calendar list failed')
    return []
  }

  const res = []
  for (const item of data.items) {
    const e = {} as Calendar
    e.title = item.summary
    e.id = item.id
    e.timeZone = item.timeZone
    e.colorId = item.colorId
    res.push(e)
  }

  Log.d(res)
  return res
}

export type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  md: string
  time: Time
  htmlLink: string
  status: string
}

async function fetchEvent(calendar: Calendar): Promise<CalendarEvent[]> {
  if (!calendar) return []
  const calendarId = calendar.id
  const timeZone = calendar.timeZone
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`
  const min = format(new Date(), "yyyy-MM-dd'T'00:00:00XXX", {
    timeZone: timeZone,
  })
  const max = format(new Date(), "yyyy-MM-dd'T'23:59:59XXX", {
    timeZone: timeZone,
  })

  let p = new URLSearchParams()
  p.append('timeMin', min)
  p.append('timeMax', max)
  p.append('timeZone', timeZone)
  p.append('orderBy', 'startTime')
  p.append('singleEvents', 'true')
  Log.d(p.toString())

  let data
  try {
    data = await fetchWrapper(url + '?' + p.toString())
    if (!data) throw Error()
  } catch {
    Log.w('fetch event list failed')
    return []
  }

  const res = []
  for (const item of data.items) {
    try {
      const e = {} as CalendarEvent
      e.id = item.id
      e.title = item.summary
      e.start = item.start.dateTime
      e.end = item.end.dateTime
      const d = differenceInMinutes(new Date(e.end), new Date(e.start))
      e.time = new Time(0, d % 60, Math.floor(d / 60))
      e.md = `${DEFAULT}${e.title} ~/${e.time.toString()}`
      e.htmlLink = item.htmlLink
      e.status = item.status
      res.push(e)
    } catch {
      Log.v(item)
    }
  }

  Log.d(res)
  return res
}

export const GoogleCalendar = {
  async getCalendar(): Promise<Calendar[]> {
    return fetchCalendar()
  },
  async getEvents(calendar: Calendar): Promise<CalendarEvent[]> {
    return fetchEvent(calendar)
  },
}
