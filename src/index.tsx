import * as React from 'react'
import * as ReactDOM from 'react-dom'

import '@/css/tailwind.css'
import Popup from '@/components/Popup'
import '@/css/tailwind-utils.css'

function initPoupup() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
    ReactDOM.render(<Popup />, document.getElementById('popup'))
  })
}

void initPoupup()
