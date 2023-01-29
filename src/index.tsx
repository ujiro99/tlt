import * as React from 'react'
import { createRoot } from 'react-dom/client'

import '@/css/tailwind.css'
import '@/css/tailwind-utils.css'
import Popup from '@/components/Popup'

document.addEventListener(
  'DOMContentLoaded',
  function () {
    const root = createRoot(document.getElementById('popup'))
    root.render(<Popup />)
  },
  false,
)
