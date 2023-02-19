import { Storage, STORAGE_KEY } from '@/services/storage'
import { REDIRECT_URL } from '@/const'
import { Ipc } from './services/ipc'

const getOAuthToken = async () => {
  const responseUrl = document.location.href
  if (!responseUrl.startsWith(REDIRECT_URL)) {
    return
  }

  const params = new URLSearchParams(new URL(responseUrl).hash.slice(1))
  const state = params.get('state')
  const token = params.get('access_token')
  const oauthState = await Storage.get(STORAGE_KEY.OAUTH_STATE)
  await Storage.remove(STORAGE_KEY.OAUTH_STATE)

  if (state === oauthState && token) {
    await Storage.set(STORAGE_KEY.ACCESS_TOKEN, token)
    Ipc.send({
      command: 'token',
      param: true,
    })
  } else {
    Ipc.send({
      command: 'token',
      param: false,
    })
  }
}

getOAuthToken()
