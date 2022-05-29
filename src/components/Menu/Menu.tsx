import React, { useState, useEffect } from 'react'

import { Calendar } from '@/components/Menu/Calendar'
import { ReportSummary } from '@/components/Menu/ReportSummary'
import { Copy } from '@/components/Menu/Copy'
import { Edit } from '@/components/Menu/Edit'
import {  sleep } from '@/services/util'

import './Menu.css'

export function Menu(): JSX.Element {
  const [isFixed, setFixed] = useState(false)

  useEffect(() => {
    let intersectionObserver: IntersectionObserver
    void (async () => {
      intersectionObserver = new IntersectionObserver(
        function (entries) {
          setFixed(!entries[0].isIntersecting)
        },
        {
          root: document.querySelector('#popup'),
          rootMargin: '-25px 0px -20px 0px',
        },
      )
      await sleep(200)
      intersectionObserver.observe(document.querySelector('.calendar'))
    })()
    return () => {
      intersectionObserver.disconnect()
    }
  }, [])

  return (
    <>
      <header className="menu__sticky">
        <div className="menu__button">
          <Edit />
          <Copy />
        </div>
      </header>
      <div className="menu">
        <Calendar fixed={isFixed} />
        <ReportSummary fixed={isFixed} />
      </div>
    </>
  )
}
