import { format } from 'date-fns-tz'
import { differenceInMinutes } from 'date-fns'
import { Time } from '@/models/time'
import Log from '@/services/log'
import { DEFAULT } from '@/const'

type Event = {
  title: string
  start: string
  end: string
  md: string
  time: Time
}

async function fetchEvent(token: string): Promise<Event[]> {
  Log.d(token)

  const init = {
    method: 'GET',
    async: true,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    contentType: 'json',
  }

  const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'
  const timeZone = 'Asia/Tokyo'
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
  Log.d(p.toString())

  const response = await fetch(url + '?' + p.toString(), init)
  const data = await response.json()

  const res = []
  for (const item of data.items) {
    const e = {} as Event
    e.title = item.summary
    e.start = item.start.dateTime
    e.end = item.end.dateTime
    const d = differenceInMinutes(new Date(e.end), new Date(e.start))
    e.time = new Time(0, d % 60, Math.floor(d / 60))
    e.md = `${DEFAULT} ${e.title} ~/${e.time.toString()}`
    res.push(e)
  }

  Log.d(res)
  return res
}

export const GoogleCalendar = {
  async getEvents(): Promise<Event[]> {
    return new Promise((resolve) => {
      chrome.identity.getAuthToken({ interactive: true }, (token: string) => {
        resolve(fetchEvent(token))
      })
    })
  },
}
