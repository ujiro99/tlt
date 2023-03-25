/**
 * @jest-environment jsdom
 */

import { RecoilRoot } from 'recoil'
import { waitFor, renderHook, act } from '@testing-library/react'
import { useTrackingState, useTrackingMove } from './useTrackingState'
import { Parser } from '@/services/parser'

import * as useCalendarEventModule from './useCalendarEvent'
import { Storage } from '@/services/storage'

jest.mock('@/hooks/useCalendarEvent')
jest.mock('@/services/storage')
jest.mock('@/services/ipc')

const storage = {}

beforeEach(() => {
  const calendarEventMock = useCalendarEventModule as jest.Mocked<
    typeof useCalendarEventModule
  >
  calendarEventMock.useCalendarEvent.mockReturnValue({
    events: [],
    appendEvents: (events) => {},
    uploadEvents: async (events, calendar, color, resolve) => {},
  })

  const StorageMock = Storage as jest.Mocked<typeof Storage>
  StorageMock.get.mockImplementation(async (key) => storage[key])
  StorageMock.set.mockImplementation(async (key, val) => (storage[key] = val))
})

test('Trackings is empty default.', async () => {
  const { result } = renderHook(() => useTrackingState(), {
    wrapper: RecoilRoot,
  })
  await waitFor(() => {
    expect(result.current.trackings.length).toBe(0)
  })
})

test('Add a tracking', async () => {
  const { result } = renderHook(() => useTrackingState(), {
    wrapper: RecoilRoot,
  })

  const rootNode = Parser.parseMd('- [ ] task')

  act(() => {
    result.current.startTracking(rootNode.children[0])
  })

  await waitFor(() => {
    expect(result.current.trackings.length).toBe(1)
    expect(result.current.trackings[0].line).toBe(1)
  })
})

test('Move a tracking position', async () => {
  const { result } = renderHook(
    () => {
      return {
        state: useTrackingState(),
        move: useTrackingMove(),
      }
    },
    {
      wrapper: RecoilRoot,
    },
  )
  const rootNode = Parser.parseMd('- [ ] task')

  act(() => {
    result.current.state.startTracking(rootNode.children[0])
  })

  await waitFor(() => {
    expect(result.current.state.trackings.length).toBe(1)
    expect(result.current.state.trackings[0].line).toBe(1)
  })

  act(() => {
    result.current.move.moveTracking(1, 2)
  })

  await waitFor(() => {
    expect(result.current.state.trackings[0].line).toBe(2)
  })
})

test('Move a line above the line being tracked', async () => {
  const { result } = renderHook(
    () => {
      return {
        state: useTrackingState(),
        move: useTrackingMove(),
      }
    },
    {
      wrapper: RecoilRoot,
    },
  )

  const rootNode = Parser.parseMd('- [ ] task')

  act(() => {
    result.current.state.startTracking(rootNode.children[0])
  })

  act(() => {
    result.current.move.moveTracking(2, 1)
  })

  await waitFor(() => {
    expect(result.current.state.trackings[0].line).toBe(2)
  })
})

test('Move a line below the line being tracked', async () => {
  const { result } = renderHook(
    () => {
      return {
        state: useTrackingState(),
        move: useTrackingMove(),
      }
    },
    {
      wrapper: RecoilRoot,
    },
  )

  const rootNode = Parser.parseMd('- [ ] task')

  act(() => {
    result.current.state.startTracking(rootNode.children[0])
  })

  act(() => {
    result.current.move.moveTracking(0, 2)
  })

  await waitFor(() => {
    expect(result.current.state.trackings[0].line).toBe(0)
  })
})
