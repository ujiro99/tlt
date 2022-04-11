import React, { useState } from 'react'
import { useRecoilValue } from 'recoil'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import Modal from 'react-modal'
import classnames from 'classnames'

import { modeState, MODE } from '@/components/Menu/Menu'
import { useTaskManager, useTaskRecordKeys } from '@/hooks/useTaskManager'
import { useCalendarDate } from '@/hooks/useCalendarDate'
import { dateToKey } from '@/services/util'

import './Calendar.css'

const modalStyles = {
  content: {
    top: '80px',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    padding: '0',
    transform: 'translate(-50%, 0)',
    border: 'none',
  },
}

function MyCalendar(): JSX.Element {
  const [visible, setVisible] = useState(false)
  const [date, setDate] = useCalendarDate()
  const manager = useTaskManager()
  const [recordKeys] = useTaskRecordKeys()

  const mode = useRecoilValue(modeState)
  const isAvailable = mode === MODE.SHOW

  function toggleCalendar() {
    if (!isAvailable) return
    setVisible(!visible)
  }

  function tileDisabled({ date, view }) {
    // Disable tiles in month view only
    if (view === 'month') {
      // Check if a date React-Calendar wants to check is on the list of disabled dates
      const k = dateToKey(date)
      return recordKeys.find((key) => key === k) === undefined
    }
  }

  function onChange(date: Date) {
    setDate(date)
    manager.setKey(dateToKey(date))
    setVisible(false)
  }

  Modal.setAppElement(document.getElementById('popup'))

  return (
    <>
      <button
        className={classnames('icon-button', 'mod--date', {
          'mod--disable': !isAvailable,
        })}
        onClick={toggleCalendar}
      >
        <svg className="icon-button__icon">
          <use xlinkHref="/icons.svg#icon-calendar" />
        </svg>
        <span className="icon-button__label">Date</span>
      </button>

      <Modal
        isOpen={visible}
        onRequestClose={toggleCalendar}
        style={modalStyles}
      >
        <div>
          <Calendar
            onChange={onChange}
            value={date}
            tileDisabled={tileDisabled}
          />
        </div>
      </Modal>
    </>
  )
}

export { MyCalendar as Calendar }
