import React, { useState } from 'react'
import Modal from 'react-modal'

import { useOauthState } from '@/hooks/useOauthState'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useSyncModal } from '@/hooks/useSyncModal'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Icon } from '@/components/Icon'
import { Calendar, Event } from '@/services/google/calendar'
import { sleep } from '@/services/util'

import { CalendarList } from './CalendarList'
import { EventList } from './EventList'
import { Account } from './Account'
import { SyncButton } from './SyncButton'

import './SyncModal.css'

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement(document.getElementById('popup'))

export function SyncModal(): JSX.Element {
  const manager = useTaskManager()
  const analytics = useAnalytics()
  const isLoggedIn = useOauthState()
  const [visible, setVisible] = useSyncModal()
  const [calendar, setCalendar] = useState<Calendar>()
  const [events, setEvents] = useState<Event[]>()

  const calendarExists = calendar != null
  const eventExists = events?.length > 0

  const afterOpenModal = () => {}

  const onRequestClose = () => {
    setVisible(false)
  }

  const importGoogle = async () => {
    analytics.track('import google calendar')
    const tasks = events.map((e) => e.md).join('\n')
    manager.appendText(tasks)
    await sleep(2000)
    return true
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
            <Account />
          </section>
          {isLoggedIn ? (
            <>
              <section className="google-calendar__import">
                <h3 className="google-calendar__section-title">Import</h3>
                <div className="google-calendar__select-calendar">
                  <CalendarList onChangeCalendar={setCalendar} />
                  {calendarExists && (
                    <EventList calendar={calendar} onChangeEvents={setEvents} />
                  )}
                </div>
                <div className="google-calendar__import-button">
                  <SyncButton enable={eventExists} onClick={importGoogle} />
                </div>
              </section>
              <section className="google-calendar__upload">
                <h3 className="google-calendar__section-title">Upload</h3>
              </section>
            </>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}
