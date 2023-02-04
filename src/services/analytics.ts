import mixpanel from 'mixpanel-browser'
import { isDebug } from '@/const'

// mixpanel

export const analytics = {
  init() {
    mixpanel.init('a6bc5429291d17f1f25b16ed4cff3ae2', {
      debug: isDebug,
      persistence: 'localStorage',
    })
  },

  track(eventName: string, screen?: string, others?: object) {
    mixpanel.track(eventName, {
      screen: screen,
      ...others,
    })
  },
}
