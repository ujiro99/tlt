import React, { useState } from 'react'
import classNames from 'classnames'

import { useStorage } from '@/hooks/useStorage'
import { useAnalytics } from '@/hooks/useAnalytics'
import { STORAGE_KEY } from '@/services/storage'
import { t } from '@/services/i18n'
import { Select } from '@/components/Select'
import { Icon } from '@/components/Icon'
import {
  AlarmRule,
  ALARM_TIMING,
  ALARM_ANCHOR,
  AlarmTiming,
  AlarmAnchor,
} from '@/models/alarmRule'

import './AlarmEditor.css'

type Timing = {
  timing: AlarmTiming
  anchor: AlarmAnchor
}

export function AlarmEditor(): JSX.Element {
  const [minutes, setMinutes] = useState<number>(0)
  const [timing, setTiming] = useState<Timing>({} as Timing)
  const [alarms, setAlarms] = useStorage<AlarmRule[]>(STORAGE_KEY.ALARMS)
  const analytics = useAnalytics()

  const alarmExists = alarms?.length > 0
  const isValid = AlarmRule.checkParams(timing.timing, timing.anchor, minutes)

  const handleChangeTiming = (e) => {
    const vals = e.target.value.split(',')
    setTiming({ timing: vals[0], anchor: vals[1] })
  }

  const handleChangeMinutes = (e) => {
    setMinutes(e.target.value)
  }

  const handleClickAdd = () => {
    if (!isValid) return
    const rule = new AlarmRule(timing.timing, timing.anchor, minutes - 0)
    const newRules = [...alarms, rule]
    setAlarms(newRules)
    analytics.track('click add alarmRule')
  }

  const handleClickDelete = (id) => {
    const newRules = alarms.filter((r) => r.id !== id)
    setAlarms(newRules)
    analytics.track('click delete alarmRule')
  }

  return (
    <div className="alarm-editor">
      <section className="alarm-editor__input">
        <div className="alarm-editor__input-line">
          <label>
            <input
              type="number"
              className="alarm-editor__input-minutes"
              value={minutes}
              onChange={handleChangeMinutes}
              min={0}
              step="5"
            ></input>
            <span>{t('minutes')}</span>
          </label>
          <Select
            className="alarm-editor__input-timing"
            onChange={handleChangeTiming}
            value={`${timing.timing},${timing.anchor}`}
          >
            <option value="" hidden>
              {t('please_select')}
            </option>
            <option value={`${ALARM_TIMING.AFTER},${ALARM_ANCHOR.START}`}>
              {t('alarm_opt_after_start')}
            </option>
            <option value={`${ALARM_TIMING.BEFORE},${ALARM_ANCHOR.SCEHEDULED}`}>
              {t('alarm_opt_before_sceheduled')}
            </option>
            <option value={`${ALARM_TIMING.AFTER},${ALARM_ANCHOR.SCEHEDULED}`}>
              {t('alarm_opt_after_sceheduled')}
            </option>
          </Select>
        </div>
        <div className="alarm-editor__input-button">
          <button
            className={classNames('alarm-editor__button', {
              'mod-disable': !isValid,
            })}
            onClick={handleClickAdd}
          >
            Add
          </button>
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
