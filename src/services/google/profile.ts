import Log from '@/services/log'
import { getHeader } from './util'
import { ensureToken } from './oauth'

export type Profile = {
  name: string
  email: string
  photo: string
}

async function getProfile(token: string): Promise<Profile> {
  const url =
    'https://people.googleapis.com/v1/people/me?personFields=names%2Cphotos%2CemailAddresses'
  const response = await fetch(url, getHeader(token))
  const data = await response.json()
  const p = {} as Profile
  try {
    p.name = data['names'][0]['displayName']
    p.email = data['emailAddresses'][0]['value']
    p.photo = data['photos'][0]['url']
  } catch (e) {
    Log.w(e)
  }
  Log.d(p)
  return p
}

export const GoogleProfile = {
  async getProfile(): Promise<Profile> {
    return new Promise(async (resolve) => {
      const token = await ensureToken()
      const profile = await getProfile(token)
      Log.v(profile)
      resolve(profile)
    })
  },
}
