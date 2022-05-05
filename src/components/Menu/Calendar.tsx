import React, { useState } from 'react'
import { useRecoilValue } from 'recoil'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import Modal from 'react-modal'

import { modeState, MODE } from '@/components/Menu/Menu'
import { RecordName } from '@/components/Menu/RecordName'
import { Icon } from '@/components/Icon'
import { useTaskManager, useTaskRecordKeys } from '@/hooks/useTaskManager'
import { useCalendarDate } from '@/hooks/useCalendarDate'
import { eventStop } from '@/services/util'
import { TaskRecordKey } from '@/models/taskRecordKey'

import './Calendar.css'
import styles from '../Modal.module.css'

function MyCalendar(): JSX.Element {
  const [visible, setVisible] = useState(false)
  const [date, setDate] = useCalendarDate()
  const manager = useTaskManager()
  const [recordKeys] = useTaskRecordKeys()

  const mode = useRecoilValue(modeState)
  const selectRange = mode === MODE.REPORT

  function toggleCalendar() {
    setVisible(!visible)
  }

  function tileDisabled({ date, view }) {
    // Disable tiles in month view only
    if (view === 'month') {
      // Check if a date React-Calendar wants to check is on the list of disabled dates
      const k = TaskRecordKey.dateToKey(date)
      return recordKeys.find((key) => key === k) === undefined
    }
  }

  function onChange(date: Date) {
    setDate(date)
    manager.setKey(TaskRecordKey.fromDate(date))
    setVisible(false)
  }

  Modal.setAppElement(document.getElementById('popup'))

  return (
    <div className="calendar" onClick={toggleCalendar}>
      <button className="calendar__button" >
        <Icon className="calendar__icon" name="calendar" />
      </button>

      <RecordName />

      <Modal
        isOpen={visible}
        onRequestClose={toggleCalendar}
        className={styles.ModalContent}
      >
        <div onClick={eventStop}>
          <Calendar
            onChange={onChange}
            value={date}
            tileDisabled={tileDisabled}
            selectRange={selectRange}
          />
        </div>
      </Modal>
    </div>
  )
}

export { MyCalendar as Calendar }
