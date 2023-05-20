import React, { useState } from 'react'
import classNames from 'classnames'

import { useStorage } from '@/hooks/useStorage'
import { STORAGE_KEY } from '@/services/storage'
import { t } from '@/services/i18n'
import { Select } from '@/components/Select'
import { Icon } from '@/components/Icon'
import { AlarmRule, ALARM_TIMING, ALARM_ANCHOR } from '@/models/alarmRule'

import './AlarmEditor.css'

const anchorRule = {
  '': {},
  [ALARM_TIMING.BEFORE]: {
    [ALARM_ANCHOR.START]: false,
    [ALARM_ANCHOR.SCEHEDULED]: true,
  },
  [ALARM_TIMING.AFTER]: {
    [ALARM_ANCHOR.START]: true,
    [ALARM_ANCHOR.SCEHEDULED]: true,
  },
}

export function AlarmEditor(): JSX.Element {
  const [timing, setTiming] = useState('')
  const [anchor, setAnchor] = useState('')
  const [minutes, setMinutes] = useState<number>(0)
  const [alarms, setAlarms] = useStorage<AlarmRule[]>(STORAGE_KEY.ALARMS)

  const alarmExists = alarms?.length > 0
  const isValid = AlarmRule.checkParams(timing, anchor, minutes)

  const handleChangeTiming = (e) => {
    setTiming(e.target.value)
    if (e.target.value === ALARM_TIMING.BEFORE) {
      setAnchor(ALARM_ANCHOR.SCEHEDULED)
    }
  }

  const handleChangeAnchor = (e) => {
    setAnchor(e.target.value)
  }

  const handleChangeMinutes = (e) => {
    setMinutes(e.target.value)
  }

  const handleClickAdd = () => {
    if (!isValid) return
    const rule = new AlarmRule(timing, anchor, minutes - 0)
    const newRules = [...alarms, rule]
    setAlarms(newRules)
  }

  const handleClickDelete = (id) => {
    const newRules = alarms.filter((r) => r.id !== id)
    setAlarms(newRules)
  }

  return (
    <div className="alarm-editor">
      <section className="alarm-editor__input">
        <div className="alarm-editor__input-line1">
          <div>
            <input
              type="number"
              className="alarm-editor__input-minutes"
              value={minutes}
              onChange={handleChangeMinutes}
              min={0}
              step="5"
            ></input>
            <span>{t('minutes')}</span>
          </div>
          <Select
            className="alarm-editor__input-timing"
            onChange={handleChangeTiming}
            defaultValue={timing}
          >
            <option value="" hidden>
              {t('please_select')}
            </option>
            <option value="BEFORE">{t('alarm_timing_before')}</option>
            <option value="AFTER">{t('alarm_timing_after')}</option>
          </Select>
        </div>
        <div className="alarm-editor__input-line2">
          <Select
            className="alarm-editor__input-anchor"
            onChange={handleChangeAnchor}
            value={anchor}
          >
            <option value="" hidden>
              {t('please_select')}
            </option>
            <option
              disabled={!anchorRule[timing][ALARM_ANCHOR.START]}
              value="start time"
            >
              {t('alarm_anchor_start')}
            </option>
            <option
              disabled={!anchorRule[timing][ALARM_ANCHOR.SCEHEDULED]}
              value="scheduled time"
            >
              {t('alarm_anchor_sceheduled')}
            </option>
          </Select>
          <div>
            <button
              className={classNames('alarm-editor__button', {
                'mod-disable': !isValid,
              })}
              onClick={handleClickAdd}
            >
              Add
            </button>
          </div>
        </div>
      </section>
      <section className="alarm-editor__current">
        <ul className="alarm-editor__current-list">
          {!alarmExists && <span>{t('alarm_no_alarm_rule')}</span>}
          {alarms.map((alarm) => {
            return (
              <li className="alarm-editor__current-item" key={alarm.id}>
                <span>{AlarmRule.toText(alarm)}</span>
                <button
                  className="alarm-editor__current-item__button"
                  value={alarm.id}
                  onClick={() => handleClickDelete(alarm.id)}
                >
                  <Icon name="delete" />
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
