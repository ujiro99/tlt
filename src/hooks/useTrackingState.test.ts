/**
 * @jest-environment jsdom
 */

import { RecoilRoot } from 'recoil'
import { renderHook, act } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/react'
import { useTrackingState } from './useTrackingState'
import { TrackingState } from '@/@types/global'
import { Time } from '@/models/time'

jest.mock('@/services/storage')
jest.mock('@/services/ipc')

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

  const tracking = {
    nodeId: 'id',
    isTracking: true,
    trackingStartTime: 0,
    elapsedTime: new Time(),
    line: 1,
  } as TrackingState

  act(() => {
    result.current.addTracking(tracking)
  })

  await waitFor(() => {
    expect(result.current.trackings.length).toBe(1)
    expect(result.current.trackings[0].line).toBe(1)
  })
})

test('Move a tracking position', async () => {
  const { result } = renderHook(() => useTrackingState(), {
    wrapper: RecoilRoot,
  })

  const tracking = {
    nodeId: 'id',
    isTracking: true,
    trackingStartTime: 0,
    elapsedTime: new Time(),
    line: 1,
  } as TrackingState

  act(() => {
    result.current.addTracking(tracking)
  })

  act(() => {
    result.current.moveTracking(1, 2)
  })

  await waitFor(() => {
    expect(result.current.trackings[0].line).toBe(2)
  })
})

test('Move a line above the line being tracked', async () => {
  const { result } = renderHook(() => useTrackingState(), {
    wrapper: RecoilRoot,
  })

  const tracking = {
    nodeId: 'id',
    isTracking: true,
    trackingStartTime: 0,
    elapsedTime: new Time(),
    line: 1,
  } as TrackingState

  act(() => {
    result.current.addTracking(tracking)
  })

  act(() => {
    result.current.moveTracking(2, 1)
  })

  await waitFor(() => {
    expect(result.current.trackings[0].line).toBe(2)
  })
})

test('Move a line below the line being tracked', async () => {
  const { result } = renderHook(() => useTrackingState(), {
    wrapper: RecoilRoot,
  })

  const tracking = {
    nodeId: 'id',
    isTracking: true,
    trackingStartTime: 0,
    elapsedTime: new Time(),
    line: 1,
  } as TrackingState

  act(() => {
    result.current.addTracking(tracking)
  })

  act(() => {
    result.current.moveTracking(0, 2)
  })

  await waitFor(() => {
    expect(result.current.trackings[0].line).toBe(0)
  })
})
