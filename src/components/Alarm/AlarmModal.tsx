import React from 'react'
import Modal from 'react-modal'

import { useModal, MODAL } from '@/hooks/useModal'
import { useAlarms } from '@/hooks/useAlarms'
import { useAnalytics } from '@/hooks/useAnalytics'
import { AlarmTaskTextarea } from '@/components/Alarm/AlarmTextarea'
import { Icon } from '@/components/Icon'
import { t } from '@/services/i18n'

import '../ModalWindow.css'
import './AlarmList.css'

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement(document.getElementById('popup'))

export function AlarmModal(): JSX.Element {
  const analytics = useAnalytics()
  const { alarms } = useAlarms()
  const [visible, setVisible] = useModal(MODAL.ALARM)
  const alarmExists = alarms?.length > 0

  const afterOpenModal = () => {}

  const onRequestClose = () => {
    setVisible(false)
  }

  return (
    <Modal
      isOpen={visible}
      onAfterOpen={afterOpenModal}
      onRequestClose={onRequestClose}
      contentLabel="Alarm Modal"
      className="modal-window"
    >
      <div className="modal-window-header">
        <h2>{t('label_alarm')}</h2>
        <button
          className="modal-window-header__close icon-button"
          onClick={onRequestClose}
        >
          <Icon className="icon-button__icon" name="close" />
        </button>
      </div>
      <div className="modal-window-content">
        <section className="modal-window__section">
          <h3 className="modal-window__section-title">
            <Icon name="alart" />
            {t("alarm_current")}
          </h3>
          <ul className="alarm-list">
            {alarmExists ? (
              alarms.map((alarm) => (
                <li className="alarm-list__item" key={alarm.toString()}>
                  <p>
                    <span className="alarm-list__time">{alarm.time}</span>
                  </p>
                  <p className="alarm-list__content">
                    <span className="alarm-list__name">{alarm.name}</span>
                    <span className="alarm-list__message">{alarm.message}</span>
                  </p>
                </li>
              ))
            ) : (
              <p className="alarm-list__empty">{t('no_alarms')}</p>
            )
            }
          </ul>
        </section>
        <section className="modal-window__section">
          <h3 className="modal-window__section-title">
            <Icon name="alart" />
            {t("alarm_for_task")}
          </h3>
          <AlarmTaskTextarea />
        </section>
      </div>
    </Modal>
  )
}
