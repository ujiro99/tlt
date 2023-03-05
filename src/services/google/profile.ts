import Log from '@/services/log'
import { fetchWrapper } from './util'

export type Profile = {
  name: string
  email: string
  photo: string
}

async function fetchProfile(): Promise<Profile> {
  const url =
    'https://people.googleapis.com/v1/people/me?personFields=names%2Cphotos%2CemailAddresses'
  const data = await fetchWrapper(url)
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
    return await fetchProfile()
  },
}
