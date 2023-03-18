/**
 * @jest-environment jsdom
 */

import { RecoilRoot } from 'recoil'
import { waitFor, renderHook, act } from '@testing-library/react'
import { useTrackingState, useTrackingMove } from './useTrackingState'
import { Parser } from '@/services/parser'

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
  const { result } = renderHook(() => useTrackingState(), {
    wrapper: RecoilRoot,
  })
  const { result: move } = renderHook(() => useTrackingMove(), {
    wrapper: RecoilRoot,
  })

  const rootNode = Parser.parseMd('- [ ] task')

  act(() => {
    result.current.startTracking(rootNode.children[0])
  })

  act(() => {
    move.current.moveTracking(1, 2)
  })

  await waitFor(() => {
    expect(result.current.trackings[0].line).toBe(2)
  })
})

test('Move a line above the line being tracked', async () => {
  const { result } = renderHook(() => useTrackingState(), {
    wrapper: RecoilRoot,
  })
  const { result: move } = renderHook(() => useTrackingMove(), {
    wrapper: RecoilRoot,
  })

  const rootNode = Parser.parseMd('- [ ] task')

  act(() => {
    result.current.startTracking(rootNode.children[0])
  })

  act(() => {
    move.current.moveTracking(2, 1)
  })

  await waitFor(() => {
    expect(result.current.trackings[0].line).toBe(2)
  })
})

test('Move a line below the line being tracked', async () => {
  const { result } = renderHook(() => useTrackingState(), {
    wrapper: RecoilRoot,
  })
  const { result: move } = renderHook(() => useTrackingMove(), {
    wrapper: RecoilRoot,
  })

  const rootNode = Parser.parseMd('- [ ] task')

  act(() => {
    result.current.startTracking(rootNode.children[0])
  })

  act(() => {
    move.current.moveTracking(0, 2)
  })

  await waitFor(() => {
    expect(result.current.trackings[0].line).toBe(0)
  })
})
