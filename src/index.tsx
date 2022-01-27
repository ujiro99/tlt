import * as React from 'react'
import * as ReactDOM from 'react-dom'

import '@/css/tailwind.css'
import '@/css/tailwind-utils.css'
import Popup from '@/components/Popup'

function initPoupup() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
    ReactDOM.render(<Popup />, document.getElementById('popup'))
  })
}

void initPoupup()
