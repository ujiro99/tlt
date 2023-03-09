import React, { useState } from 'react'
import Modal from 'react-modal'

import { useOauthState } from '@/hooks/useOauthState'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useSyncModal } from '@/hooks/useSyncModal'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Icon } from '@/components/Icon'
import { Calendar, CalendarEvent } from '@/services/google/calendar'
import { sleep } from '@/services/util'
import { eventToNode } from '@/services/google/util'
import { NODE_TYPE } from '@/models/node'
import { Task } from '@/models/task'

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
  const [events, setEvents] = useState<CalendarEvent[]>()

  const calendarExists = calendar != null
  const eventExists = events?.length > 0

  const afterOpenModal = () => {}

  const onRequestClose = () => {
    setVisible(false)
  }

  const importGoogle = async () => {
    analytics.track('import google calendar')

    let nodes = events.map(eventToNode)
    let root = manager.getRoot()

    // merge
    nodes = nodes.filter((n) => {
      const matched = root.find((x) => {
        return (
          x.type === NODE_TYPE.TASK &&
          (x.data as Task).title === (n.data as Task).title
        )
      })
      if (matched) {
        const t1 = matched.data as Task
        const t2 = n.data as Task
        t2.id = t1.id
        t2.taskState = t1.taskState
        t2.actualTimes = t1.actualTimes
        t2.tags = t1.tags
        n.data = t2
        n.children = matched.children
        root = root.replace(n.clone(), (nn) => nn.line === matched.line)
        return false
      } else {
        return true
      }
    })
    nodes.forEach((n) => (root = root.append(n)))

    // update root
    manager.setRoot(root)
    await sleep(1500)
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
                {calendarExists && (
                  <p className="google-calendar__section-desc">
                    Select a calendar you wish to import.
                  </p>
                )}

                <div className="google-calendar__select-calendar">
                  <CalendarList onChangeCalendar={setCalendar} />
                  <div className="google-calendar__import-button">
                    <SyncButton enable={eventExists} onClick={importGoogle} />
                  </div>
                </div>
                {calendarExists && (
                  <EventList calendar={calendar} onChangeEvents={setEvents} />
                )}
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
