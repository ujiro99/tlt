import { OAuth } from './oauth'
import { Storage, STORAGE_KEY } from '@/services/storage'
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
    await Storage.set(STORAGE_KEY.LOGIN_STATE, false)
    const ret = await OAuth.updateToken()
    if (ret) {
      await Storage.set(STORAGE_KEY.LOGIN_STATE, true)
      return fetchWrapper(url, retryCount++)
    }
  } else {
    let text = await res.text()
    throw Error(`${res.status} ${res.statusText}\n${text}`)
  }
}
