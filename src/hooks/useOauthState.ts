import { STORAGE_KEY } from '@/services/storage'
import { useStorage } from './useStorage'

export function useOauthState(): boolean {
  const [isLoggedIn] = useStorage<boolean>(STORAGE_KEY.LOGIN_STATE)
  return isLoggedIn
}
