import mixpanel from 'mixpanel-browser'
import { isDebug, MIXPANEL_TOKEN } from '@/const'

// mixpanel

export const Analytics = {
  init() {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: isDebug,
      persistence: 'localStorage',
      api_host: 'https://api.mixpanel.com',
    })
  },

  track(eventName: string, screen?: string, others?: object) {
    mixpanel.track(eventName, {
      screen: screen,
      ...others,
    })
  },
}
