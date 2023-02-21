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

// const AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
//   REDIRECT_URL,
// )}&scope=${encodeURIComponent(SCOPES.join(' '))}&state=${state}`

const AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?scope=${encodeURIComponent(
  SCOPES.join(' '),
)}&access_type=offline&include_granted_scopes=true&response_type=code&state=${state}&redirect_uri=${encodeURIComponent(
  REDIRECT_URL,
)}&client_id=${CLIENT_ID}&prompt=consent`

async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  return response.json() // JSON のレスポンスをネイティブの JavaScript オブジェクトに解釈
}

export const OAuth = {
  tokenRefresh(): Promise<string> {
    return new Promise(async (resolve) => {
      await Storage.set(STORAGE_KEY.OAUTH_STATE, state)
      const window = await chrome.windows.create({
        url: AUTH_URL,
        width: 530,
        height: 700,
        type: 'popup',
      })
      Ipc.addListener('code', (param: string) => {
        if (param) {
          chrome.windows.remove(window.id)
          Log.d('code updated.')

          const CLIENT_SECLET = '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'

          const tokenUrl = `https://oauth2.googleapis.com/token?code=${param}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECLET}&redirect_uri=${encodeURIComponent(
            REDIRECT_URL,
          )}&grant_type=authorization_code`

          postData(tokenUrl)
            .then((res) => {
              Log.d(res)

              // access_token: "ya29.a0AVvZVsoveZeYboGd5nALNJ4lNTtDVe6tkmpbL6LhphqII7d-trBFLP_5wPJ42hXAyQ_GRQexQhh5YN_fut7e8xAIzOQ6Ei2nSyJvE50eVhDJ14MaGCIVOLJPuKQ894-3Zeb_k6POcdgYuX8TSOPfgjN5Ju4tZQaCgYKAasSARISFQGbdwaIJm43pzoKetjtQjqc9WFjKA0165"
              // expires_in: 3592
              // id_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU5NjJlN2EwNTljN2Y1YzBjMGQ1NmNiYWQ1MWZlNjRjZWVjYTY3YzYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI1NzczMjQ2MTc4NzItMjMzcjM4ajJpdm8ydmZqaHVrYmZnYXY5NTRobTN1Z3YuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI1NzczMjQ2MTc4NzItMjMzcjM4ajJpdm8ydmZqaHVrYmZnYXY5NTRobTN1Z3YuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTIyODAwMTAwMDk5OTkwOTU4MzUiLCJlbWFpbCI6InNpcm8uY29sYUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6InVYX3NuRG5SMFJpVG9rTy1aUUVPV1EiLCJuYW1lIjoieXVqaXJvIHRha2VkYSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BRWRGVHA3NG0xV3JLUkN6MEVEWENFaGc2VndNb0VuMkZVWEZqR0ZJUXlMd2hRPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6Inl1amlybyIsImZhbWlseV9uYW1lIjoidGFrZWRhIiwibG9jYWxlIjoiamEiLCJpYXQiOjE2NzY5OTI3NjQsImV4cCI6MTY3Njk5NjM2NH0.RPZnNnMhSGEDIJnF6ThS0PgAcTWloquhUFsaCZexRxfqdGB6GNehiQMoeNIC1kvjoVN-XUsoS3qZUMedqlSNJsYALFflBeRWGJh3Si5vu1MGmo_WADo4lm0fvpyZKncUE80Zb_bUxsHYumTaIWtyAOW_oa484DJL7rsRDKC7YEiKxsLSXBMdxvYaAL6Y_xRf87Qmbm5aVwyREaivAKY5HWLpnatNzZj8vZULG4ldc60MXMyN6_cTjzDhwRW8tsm8tMzSjvTW7UjqRNuqZT_177YeC9drSFodtzLcpFolHm0HhZo3FfygcmOr7xS6QOcOG3Rx1tr76ktjmR5TBfKQFg"
              // scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.profile openid"
              // token_type: "Bearer"
            })
            .catch((err) => {
              Log.e(err)
            })

          Storage.set(STORAGE_KEY.LOGIN_STATE, true)
        } else {
          Log.d('get code failed.')
        }
        resolve(param)
        return false
      })
    })
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
      if (data.aud && data.aud === CLIENT_ID) {
        Storage.set(STORAGE_KEY.LOGIN_STATE, true)
        return token
      } else {
        throw new Error('invalid token')
      }
    } catch {
      Log.d('need to refresh token')
      await OAuth.tokenRefresh()
      return (await Storage.get(STORAGE_KEY.ACCESS_TOKEN)) as string
    }
  },

  async logout(): Promise<boolean> {
    const res = await Storage.remove(STORAGE_KEY.ACCESS_TOKEN)
    if (res) {
      Storage.set(STORAGE_KEY.LOGIN_STATE, false)
      return true
    } else {
      Log.e('logout failed')
      return false
    }
  },
}
