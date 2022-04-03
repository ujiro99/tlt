import React, { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import Modal from 'react-modal'
import { add, sub, differenceInCalendarDays } from 'date-fns';

function isSameDay(a, b) {
  return differenceInCalendarDays(a, b) === 0;
}

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

Modal.setAppElement(document.getElementById('popup'))

export function CalendarIcon(): JSX.Element {
  const [visible, setVisible] = useState(false)
  const [value, onChange] = useState(new Date())

  function showCalendar() {
    setVisible(!visible)
  }

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
          <Calendar onChange={onChange} value={value}
          />
        </div>
      </Modal>
    </>
  )
}
