import React, { useContext, useEffect } from 'react'
import { RecoilRoot } from 'recoil'
import { ShepherdTour, ShepherdTourContext } from 'react-shepherd'

import { ErrorFallback } from '@/components/ErrorFallback'
import { TaskTextarea } from '@/components/TaskTextarea'
import { useMode, MODE } from '@/hooks/useMode'
import { Menu } from '@/components/Menu/Menu'
import { EmptyLine } from '@/components/EmptyLine'
import { SortableTree } from '@/components/Tree/SortableTree'
import { Report } from '@/components/Report'
import { useTaskStorage } from '@/hooks/useTaskManager'

import '@/css/common.css'
import '@/components/Popup.css'

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true
    }
  },
  useModalOverlay: true
};

function Button() {
  const tour = useContext(ShepherdTourContext);

  return (
    <button className="button dark" onClick={tour.start}>
      Start Tour
    </button>
  );
}

export default function Popup(): JSX.Element {
  useEffect(() => {
    chrome.runtime.sendMessage({ command: 'popupMounted' })
  }, [])

  const steps = [
    {
      id: 'intro',
      attachTo: { element: '.first-element' },
      beforeShowPromise: function () {
        return new Promise<void>(function (resolve) {
          setTimeout(function () {
            window.scrollTo(0, 0);
            resolve();
          }, 500);
        });
      },
      buttons: [
        {
          classes: 'shepherd-button-secondary',
          text: 'Exit',
          type: 'cancel'
        },
        {
          classes: 'shepherd-button-primary',
          text: 'Back',
          type: 'back'
        },
        {
          classes: 'shepherd-button-primary',
          text: 'Next',
          type: 'next'
        }
      ],
      classes: 'custom-class-name-1 custom-class-name-2',
      highlightClass: 'highlight',
      scrollTo: false,
      cancelIcon: {
        enabled: true,
      },
      title: 'Welcome to React-Shepherd!',
      text: ['React-Shepherd is a JavaScript library for guiding users through your React app.'],
      when: {
        show: () => {
          console.log('show step');
        },
        hide: () => {
          console.log('hide step');
        }
      }
    },
    // ...
  ];

  return (
    <ErrorFallback>
      <RecoilRoot>
        <React.Suspense fallback={<div></div>}>
          <Init />
          <Menu />
          <TaskList />
          <ShepherdTour steps={steps} tourOptions={tourOptions}>
            <Button />
          </ShepherdTour>
        </React.Suspense>
      </RecoilRoot>
    </ErrorFallback>
  )
}

function Init() {
  useTaskStorage()
  return <></>
}

function TaskList() {
  const [mode] = useMode()
  switch (mode) {
    case MODE.EDIT:
      return <TaskTextarea />
    case MODE.SHOW:
      return <ToDo />
    case MODE.REPORT:
      return <Report />
  }
}

function ToDo() {
  return (
    <div className="task-container">
      <SortableTree />
      <EmptyLine />
    </div>
  )
}
