import { Analytics } from '@/services/analytics'
import { useMode } from '@/hooks/useMode'

type Return = { track: (eventName: string) => void }

export function useAnalytics(): Return {
  const [mode] = useMode()

  const track = (eventName: string) => {
    const screen = mode
    Analytics.track(eventName, screen)
  }

  return { track: track }
}
