import { Storage, STORAGE_KEY } from '@/services/storage'
import { REDIRECT_URL } from '@/const'
import { Ipc } from './services/ipc'

const getOAuthToken = async () => {
  const responseUrl = document.location.href
  if (!responseUrl.startsWith(REDIRECT_URL)) {
    return
  }

  const params = new URLSearchParams(document.location.search);
  const state = params.get('state')
  const code = params.get('code')
  const oauthState = await Storage.get(STORAGE_KEY.OAUTH_STATE)
  await Storage.remove(STORAGE_KEY.OAUTH_STATE)

  if (state === oauthState && code) {
    Ipc.send({
      command: 'code',
      param: code,
    })
  } else {
    Ipc.send({
      command: 'code',
      param: null,
    })
  }
}

getOAuthToken()
