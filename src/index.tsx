import * as React from 'react'
import * as ReactDOM from 'react-dom'

import '@/css/tailwind.css'
import '@/css/tailwind-utils.css'
import Popup from '@/components/Popup'

document.addEventListener(
  'DOMContentLoaded',
  function () {
    ReactDOM.render(<Popup />, document.getElementById('popup'))
  },
  false,
)
