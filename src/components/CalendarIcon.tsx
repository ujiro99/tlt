import React, { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import Modal from 'react-modal'

import { useTaskManager, useTaskRecordKeys } from '@/hooks/useTaskManager'
import { dateToKey } from '@/services/util'

import '@/components/Calendar.css'

const modalStyles = {
  content: {
    top: '80px',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    padding: '0',
    transform: 'translate(-50%, 0)',
    border: 'none'
  },
}

export function CalendarIcon(): JSX.Element {
  const [visible, setVisible] = useState(false)
  const [date, setDate] = useState(new Date())
  const manager = useTaskManager()
  const [recordKeys] = useTaskRecordKeys()

  function showCalendar() {
    setVisible(!visible)
  }

  function tileDisabled({ date, view }) {
    // Disable tiles in month view only
    if (view === 'month') {
      // Check if a date React-Calendar wants to check is on the list of disabled dates
      const k = dateToKey(date)
      return recordKeys.find(key => key === k) === undefined
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
        className="w-8 py-1 my-2 text-base text-gray-500 bg-gray-100 border-none shadow hover:bg-gray-50 rounded-md transition ease-out"
        onClick={showCalendar}
      >
        <svg className="icon">
          <use xlinkHref="/icons.svg#icon-calendar" />
        </svg>
      </button>

      <Modal
        isOpen={visible}
        onRequestClose={showCalendar}
        style={modalStyles}
      >
        <div>
          <Calendar onChange={onChange} value={date}
            tileDisabled={tileDisabled}
          />
        </div>
      </Modal>
    </>
  )
}
