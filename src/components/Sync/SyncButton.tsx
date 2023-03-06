import React, { useState } from 'react'
import classnames from 'classnames'
import { Icon } from '@/components/Icon'
import { sleep } from '@/services/util'

import './SyncButton.css'

type SyncButtonParam = {
  enable: boolean
  onClick: () => Promise<boolean>
}

export function SyncButton(param: SyncButtonParam): JSX.Element {
  const [sync, setSync] = useState(false)
  const [completed, setCompleted] = useState(false)

  const onClick = async () => {
    if (sync || completed) return

    setSync(true)
    await param.onClick()
    setSync(false)
    setCompleted(true)
    await sleep(1500)
    setCompleted(false)
  }

  return (
    <button
      className={classnames('sync-button', {
        'mod-disable': !param.enable,
        'mod-sync': sync || completed,
      })}
      onClick={onClick}
    >
      {sync ? (
        <>
          <Icon className="sync-button__sync-icon" name="sync" />
          <span className="sync-button__label--sync">Processing...</span>
        </>
      ) : completed ? (
        <span>Completed!</span>
      ) : (
        <span className="sync-button__label">Import</span>
      )}
    </button>
  )
}
