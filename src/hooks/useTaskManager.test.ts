/**
 * @jest-environment jsdom
 */

import { RecoilRoot } from 'recoil'
import { waitFor, renderHook } from '@testing-library/react'
import { useTaskManager } from './useTaskManager'

jest.mock('@/services/storage')
jest.mock('@/services/ipc')

test('init manager.', () => {  
  const { result } = renderHook(() => useTaskManager(), {
    wrapper: RecoilRoot,
  })
  waitFor(() => {
    expect(result.current.lineCount).toBe(0)
  })
})