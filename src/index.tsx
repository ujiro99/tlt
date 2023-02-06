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

    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      console.log(token)

      var init = {
        method: 'GET',
        async: true,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        contentType: 'json',
      }

      fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        init,
      )
        .then((response) => response.json()) // Transform the data into json
        .then(function (data) {
          console.log(data)
        })
    })
  },
  false,
)
