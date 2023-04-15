import { REDIRECT_URL, CLIENT_ID_WEB, CLIENT_SECLET } from '@/const'
import { Ipc } from '@/services/ipc'
import {
  Storage,
  STORAGE_KEY,
  ACCOUNT_DATA,
  TOKEN_TYPE,
} from '@/services/storage'
import Log from '@/services/log'

const CLIENT_ID = CLIENT_ID_WEB

async function postData(url = '', data = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  return res.json()
}

function fetchAccessTokenByChromeIdentity(): Promise<boolean> {
  Log.d('fetchAccessTokenByChromeIdentity')
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken(
      { interactive: true },
      async (token: string) => {
        if (chrome.runtime.lastError != null || !token) {
          Log.w(chrome.runtime.lastError)
          reject(false)
          return
        }
        await Storage.set(STORAGE_KEY.ACCESS_TOKEN, token)
        await Storage.set(STORAGE_KEY.TOKEN_TYPE, TOKEN_TYPE.CHROME)
        await Storage.set(STORAGE_KEY.LOGIN_STATE, true)
        resolve(true)
      },
    )
  })
}

function fetchAccessToken(): Promise<boolean> {
  Log.d('fetchAccessToken')
  return new Promise(async (resolve) => {
    const refreshToken = await Storage.get(STORAGE_KEY.REFRESH_TOKEN)
    const tokenUrl = `https://oauth2.googleapis.com/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECLET}&refresh_token=${refreshToken}&grant_type=refresh_token`
    postData(tokenUrl)
      .then(async (res) => {
        if (!res.access_token) {
          Log.d(res)
          resolve(false)
          return
        }
        await Storage.set(STORAGE_KEY.ACCESS_TOKEN, res.access_token)
        await Storage.set(STORAGE_KEY.TOKEN_TYPE, TOKEN_TYPE.WEB)
        await Storage.set(STORAGE_KEY.LOGIN_STATE, true)
        resolve(true)
      })
      .catch((err) => {
        Log.e(err)
        resolve(false)
      })
  })
}

function fetchRefreshToken(): Promise<boolean> {
  Log.d('fetchRefreshToken')
  return new Promise(async (resolve) => {
    const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const state = Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map((n) => S[n % S.length])
      .join('')
    await Storage.set(STORAGE_KEY.OAUTH_STATE, state)

    const oauth2Manifest = chrome.runtime.getManifest().oauth2
    const SCOPES = oauth2Manifest?.scopes
    const AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?scope=${encodeURIComponent(
      SCOPES.join(' '),
    )}&access_type=offline&include_granted_scopes=true&response_type=code&state=${state}&redirect_uri=${encodeURIComponent(
      REDIRECT_URL,
    )}&client_id=${CLIENT_ID}&prompt=consent`

    // start oauth2
    const window = await chrome.windows.create({
      url: AUTH_URL,
      width: 530,
      height: 700,
      type: 'popup',
    })

    Ipc.addListener('code', (param: string) => {
      chrome.windows.remove(window.id)
      if (!param) {
        Log.w('get code failed.')
        resolve(false)
        return false
      }
      Log.d('code updated.')

      // fetch referesh token
      const tokenUrl = `https://oauth2.googleapis.com/token?code=${param}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECLET}&redirect_uri=${encodeURIComponent(
        REDIRECT_URL,
      )}&grant_type=authorization_code`

      postData(tokenUrl)
        .then(async (res) => {
          if (!res.access_token || !res.refresh_token) {
            Log.w(res)
            resolve(false)
            return
          }
          await Storage.set(STORAGE_KEY.ACCESS_TOKEN, res.access_token)
          await Storage.set(STORAGE_KEY.REFRESH_TOKEN, res.refresh_token)
          await Storage.set(STORAGE_KEY.LOGIN_STATE, true)
          resolve(true)
        })
        .catch((err) => {
          Log.e(err)
          resolve(false)
        })
      return false
    })
  })
}

export const OAuth = {
  async updateToken(): Promise<boolean> {
    try {
      // Remove cached AuthToken if exists.
      const tokenType = await Storage.get(STORAGE_KEY.TOKEN_TYPE)
      const token = (await Storage.get(STORAGE_KEY.ACCESS_TOKEN)) as string
      if (tokenType === TOKEN_TYPE.CHROME && token != null) {
        await new Promise((resolve) => {
          chrome.identity.removeCachedAuthToken({ token }, () => resolve(true))
        })
      }

      return await fetchAccessTokenByChromeIdentity()
    } catch {
      // Do not use chrome.identity in browsers other than chrome.
      let ret = await fetchAccessToken()
      if (!ret) {
        const oauthState = await Storage.get(STORAGE_KEY.OAUTH_STATE)
        if (oauthState) {
          //  If the authentication process has already started, it ends here.
          return
        }
        ret = await fetchRefreshToken()
      }
      return ret
    }
  },

  async ensureToken(): Promise<string> {
    const token = (await Storage.get(STORAGE_KEY.ACCESS_TOKEN)) as string
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${token}`,
      )
      if (!response.ok) {
        throw new Error('invalid token')
      }
      const data = await response.json()
      const CLIENT_ID_CHROME = chrome.runtime.getManifest().oauth2.client_id
      if (
        data.aud &&
        (data.aud === CLIENT_ID || data.aud === CLIENT_ID_CHROME)
      ) {
        await Storage.set(STORAGE_KEY.LOGIN_STATE, true)
        return token
      } else {
        throw new Error('CLIENT_ID mismatch')
      }
    } catch (e) {
      Log.d('need to refresh token')
      Log.e(e)
      await Storage.remove(STORAGE_KEY.OAUTH_STATE)
      await OAuth.updateToken()
      return (await Storage.get(STORAGE_KEY.ACCESS_TOKEN)) as string
    }
  },

  async getToken(): Promise<string> {
    return (await Storage.get(STORAGE_KEY.ACCESS_TOKEN)) as string
  },

  async logout(): Promise<boolean> {
    let logoutResult

    const tokenType = await Storage.get(STORAGE_KEY.TOKEN_TYPE)
    if (tokenType === TOKEN_TYPE.WEB) {
      let token = await Storage.get(STORAGE_KEY.ACCESS_TOKEN)
      let url = `https://oauth2.googleapis.com/revoke?token=${token}`
      await postData(url)
      let res1 = await Storage.remove(STORAGE_KEY.ACCESS_TOKEN)
      token = await Storage.get(STORAGE_KEY.REFRESH_TOKEN)
      url = `https://oauth2.googleapis.com/revoke?token=${token}`
      await postData(url)
      let res2 = await Storage.remove(STORAGE_KEY.REFRESH_TOKEN)
      logoutResult = res1 && res2
    } else {
      await new Promise((resolve) => {
        chrome.identity.clearAllCachedAuthTokens(() => {
          logoutResult = true
          resolve(true)
        })
      })
    }

    if (logoutResult) {
      Storage.set(STORAGE_KEY.LOGIN_STATE, false)
      ACCOUNT_DATA.forEach((key) => Storage.remove(key))
      return true
    } else {
      Log.e('logout failed')
      return false
    }
  },
}
