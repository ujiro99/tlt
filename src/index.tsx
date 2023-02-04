import * as React from 'react'
import { createRoot } from 'react-dom/client'

import '@/css/tailwind.css'
import '@/css/tailwind-utils.css'
import Popup from '@/components/Popup'
import { analytics } from '@/services/analytics'

analytics.init()

document.addEventListener(
  'DOMContentLoaded',
  function () {
    analytics.track('launch', 'index')
    const root = createRoot(document.getElementById('popup'))
    root.render(<Popup />)
  },
  false,
)
