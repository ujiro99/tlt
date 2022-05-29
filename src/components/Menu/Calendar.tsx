import React, { useState } from 'react'
import classnames from 'classnames'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import Modal from 'react-modal'

import { TaskRecordKey } from '@/models/taskRecordKey'
import { useMode, MODE } from '@/hooks/useMode'
import { useTaskManager, useTaskRecordKeys } from '@/hooks/useTaskManager'
import { useCalendarDate } from '@/hooks/useCalendarDate'
import { RecordName } from '@/components/Menu/RecordName'
import { Icon } from '@/components/Icon'
import { eventStop } from '@/services/util'

import './Calendar.css'
import styles from '../Modal.module.css'

type Props = {
  fixed: boolean
}

function MyCalendar(props: Props): JSX.Element {
  const [visible, setVisible] = useState(false)
  const { date, range, setDate, setDateRange } = useCalendarDate()
  const manager = useTaskManager()
  const [recordKeys] = useTaskRecordKeys()

  const [mode] = useMode()
  const selectRange = mode === MODE.REPORT

  const label = 'Today'
  const isFixed = props.fixed

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

  function onChange(date: Date | Date[]) {
    if (selectRange) {
      const range = date as Date[]
      setDateRange({ from: range[0], to: range[1] })
    } else {
      setDate(date as Date)
    }
    manager.setKey(TaskRecordKey.fromDate(date))
    setVisible(false)
  }

  Modal.setAppElement(document.getElementById('popup'))

  const value = selectRange ? [range.from, range.to] : date

  return (
    <div className="calendar" onClick={toggleCalendar}>
      <div className="calendar__date">
        <RecordName />
      </div>
      <div
        className={classnames('calendar__label', {
          'calendar__label--fixed': isFixed,
        })}
      >
        <span>{label}</span>
        <button className="calendar__button">
          <Icon className="calendar__icon" name="calendar" />
        </button>
      </div>

      <Modal
        isOpen={visible}
        onRequestClose={toggleCalendar}
        className={styles.ModalContent}
      >
        <div onClick={eventStop}>
          <Calendar
            onChange={onChange}
            value={value}
            tileDisabled={tileDisabled}
            selectRange={selectRange}
          />
        </div>
      </Modal>
    </div>
  )
}

export { MyCalendar as Calendar }
