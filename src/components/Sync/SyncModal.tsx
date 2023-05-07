import React, { useState } from 'react'
import Modal from 'react-modal'

import { useOauthState } from '@/hooks/useOauthState'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useModal, MODAL } from '@/hooks/useModal'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useAlarms } from '@/hooks/useAlarms'
import { useActivity } from '@/hooks/useActivity'
import { Icon } from '@/components/Icon'
import { sleep } from '@/services/util'
import { STORAGE_KEY } from '@/services/storage'
import { eventToNode } from '@/services/google/util'
import {
  Calendar,
  CalendarColor,
  CalendarEvent,
} from '@/services/google/calendar'
import { NODE_TYPE } from '@/models/node'
import { Task } from '@/models/task'
import { Alarm, ALARM_TYPE } from '@/models/alarm'

import { CalendarList } from './CalendarList'
import { EventList } from './EventList'
import { Account } from './Account'
import { SyncButton } from './SyncButton'
import { UplaodEventList } from './UploadEventList'
import { CalendarColorPicker } from './CalendarColorPicker'

import '../ModalWindow.css'
import './SyncModal.css'

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement(document.getElementById('popup'))

export function SyncModal(): JSX.Element {
  const manager = useTaskManager()
  const analytics = useAnalytics()
  const isLoggedIn = useOauthState()
  const { setAlarms } = useAlarms()
  const [visible, setVisible] = useModal(MODAL.SYNC)
  const { activities, uploadActivities } = useActivity()
  const [calendarDown, setCalendarDown] = useState<Calendar>()
  const [calendarUp, setCalendarUp] = useState<Calendar>()
  const [events, setEvents] = useState<CalendarEvent[]>()
  const [color, setColor] = useState<CalendarColor>()

  const calendarExists = calendarDown != null
  const eventExists = events?.length > 0
  const savedExists = activities?.length > 0

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
    setAlarmForEvens()
    await sleep(1500)
    return true
  }

  const setAlarmForEvens = () => {
    const alarms = events.map((event) => {
      return new Alarm({
        type: ALARM_TYPE.EVENT,
        name: event.title,
        when: new Date(event.start).getTime(),
        message: `${event.title} is starting now!`,
      })
    })
    setAlarms(alarms)
  }

  const uploadGoogle = () => {
    analytics.track('upload google calendar')
    return new Promise((resolve) => {
      uploadActivities(activities, calendarUp, color, resolve)
    })
  }

  return (
    <Modal
      isOpen={visible}
      onAfterOpen={afterOpenModal}
      onRequestClose={onRequestClose}
      contentLabel="Sync Modal"
      className="modal-window"
    >
      <div className="modal-window-header">
        <h2>Sync with Google Calendar</h2>
        <button
          className="modal-window-header__close icon-button"
          onClick={onRequestClose}
        >
          <Icon className="icon-button__icon" name="close" />
        </button>
      </div>
      <div className="modal-window-content">
        <div className="google-calendar">
          <section className="google-calendar__login">
            <Account />
          </section>
          {isLoggedIn ? (
            <>
              <section className="google-calendar__import">
                <h3 className="google-calendar__section-title">
                  <Icon name="download" />
                  Download
                </h3>
                {calendarExists && (
                  <p className="google-calendar__section-desc">
                    Select a calendar you wish to import.
                  </p>
                )}
                <div className="google-calendar__select-calendar">
                  <CalendarList
                    onChangeCalendar={setCalendarDown}
                    calendarKey={STORAGE_KEY.CALENDAR_DOWNLOAD}
                  />
                  <div className="google-calendar__import-button">
                    <SyncButton enable={eventExists} onClick={importGoogle}>
                      Import
                    </SyncButton>
                  </div>
                </div>
                {calendarExists && (
                  <EventList
                    calendar={calendarDown}
                    onChangeEvents={setEvents}
                  />
                )}
              </section>
              <section className="google-calendar__upload">
                <h3 className="google-calendar__section-title">
                  <Icon name="upload" />
                  Upload
                </h3>
                {calendarExists && (
                  <p className="google-calendar__section-desc">
                    Select a calendar you wish to upload.
                  </p>
                )}
                <div className="google-calendar__select-calendar">
                  <CalendarList
                    onChangeCalendar={setCalendarUp}
                    calendarKey={STORAGE_KEY.CALENDAR_UPLOAD}
                  />
                  <div className="google-calendar__color">
                    <CalendarColorPicker
                      defaultId={calendarUp?.colorId}
                      onChangeColor={setColor}
                      type="event"
                    />
                  </div>
                  <div className="google-calendar__import-button">
                    <SyncButton enable={savedExists} onClick={uploadGoogle}>
                      Upload
                    </SyncButton>
                  </div>
                </div>
                <UplaodEventList />
              </section>
            </>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}
