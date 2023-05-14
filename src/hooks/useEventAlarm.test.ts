/**
 * @jest-environment jsdom
 */

import { RecoilRoot } from 'recoil'
import { waitFor, renderHook, act } from '@testing-library/react'
import { useEventAlarm } from './useEventAlarm'
import { CalendarEvent } from '@/services/google/calendar'

import * as useStorageModule from './useStorage'
jest.mock('@/hooks/useStorage')

let storage = []
let useStorageMock

beforeEach(() => {
  useStorageMock = useStorageModule as jest.Mocked<
    typeof useStorageModule
  >
  const func = jest.fn().mockImplementation((val) => (storage = val))
  useStorageMock.useStorage.mockReturnValue([storage, func])
})

afterEach(() => {
  storage = []
})

describe('setEventLine', () => {
  test('Set empty data', async () => {
    const { result } = renderHook(
      () => {
        return useEventAlarm()
      },
      {
        wrapper: RecoilRoot,
      },
    )
    const eventLines = []

    act(() => {
      result.current.setEventLines(eventLines)
    })

    await waitFor(() => {
      expect(storage.length).toBe(0)
    })
  })

  test('Set a data', async () => {
    const { result } = renderHook(
      () => {
        return useEventAlarm()
      },
      {
        wrapper: RecoilRoot,
      },
    )

    const eventLines = [
      { event: { id: 1 } as unknown as CalendarEvent, line: 1 },
      { event: { id: 2 } as unknown as CalendarEvent, line: 2 },
      { event: { id: 3 } as unknown as CalendarEvent, line: 3 },
    ]

    act(() => {
      result.current.setEventLines(eventLines)
    })

    await waitFor(() => {
      expect(storage.length).toBe(3)
    })
  })
})

describe('moveLine', () => {
  test('exchange', async () => {
    let eventLines = [
      { event: { id: 1 } as unknown as CalendarEvent, line: 1 },
      { event: { id: 2 } as unknown as CalendarEvent, line: 2 },
      { event: { id: 3 } as unknown as CalendarEvent, line: 3 },
    ]
    const func = jest.fn().mockImplementation((val) => (eventLines = val))
    useStorageMock.useStorage.mockReturnValue([eventLines, func])

    const { result } = renderHook(
      () => {
        return useEventAlarm()
      },
      {
        wrapper: RecoilRoot,
      },
    )

    act(() => {
      result.current.moveEventLine(1, 2)
    })

    await waitFor(() => {
      expect(eventLines[0].line).toBe(2)
      expect(eventLines[1].line).toBe(1)
      expect(eventLines[2].line).toBe(3)
    })
  })

  test('move down', async () => {
    let eventLines = [
      { event: { id: 1 } as unknown as CalendarEvent, line: 2 },
      { event: { id: 2 } as unknown as CalendarEvent, line: 3 },
      { event: { id: 3 } as unknown as CalendarEvent, line: 4 },
    ]
    const func = jest.fn().mockImplementation((val) => (eventLines = val))
    useStorageMock.useStorage.mockReturnValue([eventLines, func])
    
    const { result } = renderHook(
      () => {
        return useEventAlarm()
      },
      {
        wrapper: RecoilRoot,
      },
    )

    act(() => {
      result.current.moveEventLine(1, 5)
    })

    await waitFor(() => {
      expect(eventLines[0].line).toBe(1)
      expect(eventLines[1].line).toBe(2)
      expect(eventLines[2].line).toBe(3)
    })
  })
  
  test('move up', async () => {
    let eventLines = [
      { event: { id: 1 } as unknown as CalendarEvent, line: 2 },
      { event: { id: 2 } as unknown as CalendarEvent, line: 3 },
      { event: { id: 3 } as unknown as CalendarEvent, line: 4 },
    ]
    const func = jest.fn().mockImplementation((val) => (eventLines = val))
    useStorageMock.useStorage.mockReturnValue([eventLines, func])
    
    const { result } = renderHook(
      () => {
        return useEventAlarm()
      },
      {
        wrapper: RecoilRoot,
      },
    )

    act(() => {
      result.current.moveEventLine(5, 2)
    })

    await waitFor(() => {
      expect(eventLines[0].line).toBe(3)
      expect(eventLines[1].line).toBe(4)
      expect(eventLines[2].line).toBe(5)
    })
  })

  test('move down & keep', async () => {
    let eventLines = [
      { event: { id: 1 } as unknown as CalendarEvent, line: 2 },
      { event: { id: 2 } as unknown as CalendarEvent, line: 3 },
      { event: { id: 3 } as unknown as CalendarEvent, line: 4 },
    ]
    const func = jest.fn().mockImplementation((val) => (eventLines = val))
    useStorageMock.useStorage.mockReturnValue([eventLines, func])
    
    const { result } = renderHook(
      () => {
        return useEventAlarm()
      },
      {
        wrapper: RecoilRoot,
      },
    )

    act(() => {
      result.current.moveEventLine(1, 3)
    })

    await waitFor(() => {
      expect(eventLines[0].line).toBe(1)
      expect(eventLines[1].line).toBe(2)
      expect(eventLines[2].line).toBe(4)
    })
  })

  test('move up & keep', async () => {
    let eventLines = [
      { event: { id: 1 } as unknown as CalendarEvent, line: 2 },
      { event: { id: 2 } as unknown as CalendarEvent, line: 3 },
      { event: { id: 3 } as unknown as CalendarEvent, line: 4 },
    ]
    const func = jest.fn().mockImplementation((val) => (eventLines = val))
    useStorageMock.useStorage.mockReturnValue([eventLines, func])
    
    const { result } = renderHook(
      () => {
        return useEventAlarm()
      },
      {
        wrapper: RecoilRoot,
      },
    )

    act(() => {
      result.current.moveEventLine(5, 3)
    })

    await waitFor(() => {
      expect(eventLines[0].line).toBe(2)
      expect(eventLines[1].line).toBe(4)
      expect(eventLines[2].line).toBe(5)
    })
  })

  test('add', async () => {
    let eventLines = [
      { event: { id: 1 } as unknown as CalendarEvent, line: 2 },
      { event: { id: 2 } as unknown as CalendarEvent, line: 3 },
      { event: { id: 3 } as unknown as CalendarEvent, line: 4 },
    ]
    const func = jest.fn().mockImplementation((val) => (eventLines = val))
    useStorageMock.useStorage.mockReturnValue([eventLines, func])
    
    const { result } = renderHook(
      () => {
        return useEventAlarm()
      },
      {
        wrapper: RecoilRoot,
      },
    )

    act(() => {
      result.current.moveEventLine(null, 3)
    })

    await waitFor(() => {
      expect(eventLines[0].line).toBe(2)
      expect(eventLines[1].line).toBe(4)
      expect(eventLines[2].line).toBe(5)
    })
  })
  
  test('remove', async () => {
    let eventLines = [
      { event: { id: 1 } as unknown as CalendarEvent, line: 2 },
      { event: { id: 2 } as unknown as CalendarEvent, line: 3 },
      { event: { id: 3 } as unknown as CalendarEvent, line: 4 },
    ]
    const func = jest.fn().mockImplementation((val) => (eventLines = val))
    useStorageMock.useStorage.mockReturnValue([eventLines, func])
    
    const { result } = renderHook(
      () => {
        return useEventAlarm()
      },
      {
        wrapper: RecoilRoot,
      },
    )

    act(() => {
      result.current.moveEventLine(3, null)
    })

    await waitFor(() => {
      expect(eventLines[0].line).toBe(2)
      expect(eventLines[1].line).toBe(3)
    })
  })
})
