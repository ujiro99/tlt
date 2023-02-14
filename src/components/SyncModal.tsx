import React from 'react'
import Modal from 'react-modal'

import { GoogleCalendar } from '@/services/googleCalendar'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useSyncModal } from '@/hooks/useSyncModal'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Icon } from '@/components/Icon'

import '@/components/SyncModal.css'

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement(document.getElementById('popup'))

export function SyncModal(): JSX.Element {
  const manager = useTaskManager()
  const analytics = useAnalytics()
  const [visible, setVisible] = useSyncModal()

  const afterOpenModal = async () => {
    const REDIRECT_URL = chrome.identity.getRedirectURL()
    const oauth2Manifest = chrome.runtime.getManifest().oauth2
    const CLIENT_ID = oauth2Manifest?.client_id
    const SCOPES = oauth2Manifest?.scopes
    if (CLIENT_ID == null || SCOPES == null) {
      return
    }
    console.log(REDIRECT_URL)

    const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const state = Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map((n) => S[n % S.length])
      .join('')

    const AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
      REDIRECT_URL,
    )}&scope=${encodeURIComponent(SCOPES.join(' '))}&state=${state}`

    chrome.identity.launchWebAuthFlow(
      { interactive: true, url: AUTH_URL },
      (responseUrl) => {
        console.log(responseUrl)
      },
    )
  }

  const onRequestClose = () => {
    setVisible(false)
  }

  const importGoogle = async () => {
    analytics.track('import google calendar')
    let events = await GoogleCalendar.getEvents()

    for (let e of events) {
      manager.appendText(e.md)
    }
  }

  return (
    <Modal
      isOpen={visible}
      onAfterOpen={afterOpenModal}
      onRequestClose={onRequestClose}
      contentLabel="Sync Modal"
      className="sync-modal"
    >
      <div className="sync-modal-header">
        <h2>Sync with Google Calendar</h2>
        <button
          className="sync-modal-header__close icon-button"
          onClick={onRequestClose}
        >
          <Icon className="icon-button__icon" name="close" />
        </button>
      </div>
      <div className="sync-modal-content">
        <div className="google-calendar">
          <section className="google-calendar__login">
            <h3 className="google-calendar__section-title">Login</h3>
          </section>
          <section className="google-calendar__import">
            <h3 className="google-calendar__section-title">Import</h3>
            <div className="google-calendar__select-calendar">
              Select the calendar you wish to import.
              <select></select>
            </div>
            <div>
              <button
                className="google-calendar__button"
                onClick={importGoogle}
              >
                Import
              </button>
            </div>
          </section>
          <section className="google-calendar__upload">
            <h3 className="google-calendar__section-title">Upload</h3>
          </section>
        </div>
      </div>
    </Modal>
  )
}
