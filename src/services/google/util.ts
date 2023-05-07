import { OAuth } from './oauth'
import { CalendarEvent } from './calendar'
import { Storage, STORAGE_KEY } from '@/services/storage'
import { Task } from '@/models/task'
import { Node, NODE_TYPE } from '@/models/node'
import Log from '@/services/log'

function getOptions(token: string) {
  return {
    method: 'GET',
    async: true,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    contentType: 'json',
  }
}

function postOptions(token: string, body: object) {
  return {
    method: 'POST',
    async: true,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    contentType: 'json',
    body: JSON.stringify(body),
  }
}

export const FetchMethod = {
  GET: 'GET',
  POST: 'POST',
} as const
type FetchMethod = (typeof FetchMethod)[keyof typeof FetchMethod]

type FetchOption = {
  method: FetchMethod
  body: object
}

const RetryMax = 1
export async function fetchWrapper(
  url,
  option?: FetchOption,
  retryCount = 0,
): Promise<any> {
  if (retryCount > RetryMax) {
    Log.e('retry over')
    return
  }

  const token = await OAuth.getToken()
  let res

  if (option == null || option.method === 'GET') {
    res = await fetch(url, getOptions(token))
  } else {
    res = await fetch(url, postOptions(token, option.body))
  }

  if (res.ok && res.status === 200) {
    return await res.json()
  } else if (res.status === 401) {
    // 401 Unauthorized
    const ret = await OAuth.updateToken()
    if (ret) {
      await Storage.set(STORAGE_KEY.LOGIN_STATE, true)
      retryCount++
      return fetchWrapper(url, option, retryCount)
    }
  } else if (res.status === 403) {
    // 403 Forbidden
    // Requires reauthorization
    throw Error('403')
  } else {
    let text = await res.text()
    throw Error(`${res.status} ${res.statusText}\n${text}`)
  }
}

export function eventToNode(event: CalendarEvent): Node {
  const task = Task.parse(event.md)
  task.calendarEventId = event.id
  return new Node(NODE_TYPE.TASK, 0, task, null)
}
