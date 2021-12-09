import * as React from 'react'
import * as ReactDOM from 'react-dom'

import 'windi.css'
import '@/popup/Popup.css'

import Popup from '@/popup/Popup'

function initPoupup() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
    ReactDOM.render(<Popup />, document.getElementById('popup'))
  })
}

void initPoupup()
