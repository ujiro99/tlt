import React, { useState, useEffect } from 'react'
import classnames from 'classnames'

import { useMode, MODE } from '@/hooks/useMode'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Calendar } from '@/components/Menu/Calendar'
import { ReportSummary } from '@/components/Menu/ReportSummary'
import { TrackingStatus } from '@/components/TrackingStatus/TrackingStatus'
import { Copy } from '@/components/Menu/Copy'
import { Edit } from '@/components/Menu/Edit'
import { Sync } from '@/components/Menu/Sync'
import { Alarm } from '@/components/Menu/Alarm'
import { Icon } from '@/components/Icon'
import { sleep } from '@/services/util'

import './Menu.css'

export function Menu(): JSX.Element {
  const [isFixed, setFixed] = useState(false)
  const [mode, setMode] = useMode()
  const isReport = mode === MODE.REPORT
  const analytics = useAnalytics()

  useEffect(() => {
    let intersectionObserver: IntersectionObserver
    void (async () => {
      intersectionObserver = new IntersectionObserver(
        function (entries) {
          setFixed(!entries[0].isIntersecting)
        },
        {
          root: document.querySelector('#popup'),
          rootMargin: '-40px 0px 0px 0px',
        },
      )
      await sleep(200)
      intersectionObserver.observe(document.querySelector('.calendar'))
    })()
    return () => {
      intersectionObserver.disconnect()
    }
  }, [])

  const backTodo = () => {
    setMode(MODE.SHOW)
    analytics.track('click back todo')
  }

  return (
    <>
      <header className="menu__sticky">
        <div className="menu__button">
          <Sync />
          <Alarm />
          <Copy />
          <Edit />
        </div>
      </header>
      {isReport && (
        <button
          className={classnames('menu__back', {
            'menu__back--fixed': isFixed,
          })}
          onClick={backTodo}
        >
          <Icon name="arrow-back" />
        </button>
      )}
      <div className="menu">
        <div className="menu__left">
          <Calendar fixed={isFixed} />
          {!isReport && <ReportSummary fixed={isFixed} />}
        </div>
        <div className="menu__right">
          <TrackingStatus />
        </div>
      </div>
    </>
  )
}
