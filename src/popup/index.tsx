import * as React from 'react'
import * as ReactDOM from 'react-dom'

import '@/popup/tailwind.css'
import '@/popup/Popup.css'
import '@/popup/tailwind-utils.css'

import Popup from '@/popup/Popup'

chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
  ReactDOM.render(<Popup />, document.getElementById('popup'))
})
