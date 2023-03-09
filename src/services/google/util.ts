import { OAuth } from './oauth'
import { CalendarEvent } from './calendar'
import { Storage, STORAGE_KEY } from '@/services/storage'
import { Task } from '@/models/task'
import { Node, NODE_TYPE } from '@/models/node'
import Log from '@/services/log'

function getHeader(token: string) {
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

const RetryMax = 1
export async function fetchWrapper(url, retryCount = 0): Promise<any> {
  if (retryCount > RetryMax) {
    Log.e('retry over')
    return
  }

  const token = await OAuth.getToken()
  const res = await fetch(url, getHeader(token))
  if (res.ok && res.status === 200) {
    return await res.json()
  } else if (res.status === 401) {
    // 401 Unauthorized
    const ret = await OAuth.updateToken()
    if (ret) {
      await Storage.set(STORAGE_KEY.LOGIN_STATE, true)
      return fetchWrapper(url, retryCount++)
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
  return new Node(NODE_TYPE.TASK, 0, task, null)
}
