import { Ipc } from '../ipc'
import { Storage, STORAGE_KEY } from '../storage'
import Log from '../log'
import { REDIRECT_URL, CLIENT_ID_WEB } from '@/const'

const oauth2Manifest = chrome.runtime.getManifest().oauth2
const SCOPES = oauth2Manifest?.scopes
const CLIENT_ID = CLIENT_ID_WEB

const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const state = Array.from(crypto.getRandomValues(new Uint8Array(12)))
  .map((n) => S[n % S.length])
  .join('')

const AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
  REDIRECT_URL,
)}&scope=${encodeURIComponent(SCOPES.join(' '))}&state=${state}`

const tokenRefresh = (): Promise<boolean> => {
  return new Promise(async (resolve) => {
    await Storage.set(STORAGE_KEY.OAUTH_STATE, state)
    const window = await chrome.windows.create({
      url: AUTH_URL,
      width: 530,
      height: 700,
      type: 'popup',
    })
    Ipc.addListener('token', (param: boolean) => {
      chrome.windows.remove(window.id)
      if (param) {
        Log.d('token updated.')
      } else {
        Log.d('update token failed.')
      }
      resolve(param)
      return false
    })
  })
}

export const ensureToken = async (): Promise<string> => {
  const token = (await Storage.get(STORAGE_KEY.ACCESS_TOKEN)) as string
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${token}`,
    )
    if (!response.ok) {
      throw new Error('invalid token')
    }
    const data = await response.json()
    if (data.aud && data.aud === CLIENT_ID) {
      return token
    } else {
      throw new Error('invalid token')
    }
  } catch {
    Log.d('need to refresh token')
    await tokenRefresh()
    return (await Storage.get(STORAGE_KEY.ACCESS_TOKEN)) as string
  }
}

export const logout = async (): Promise<boolean> => {
  const res = await Storage.remove(STORAGE_KEY.ACCESS_TOKEN)
  if (res) {
    return true
  } else {
    Log.e('logout failed')
  }
}