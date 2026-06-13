import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useShops } from '../../src/hooks/useShops'
import type { Shop } from '../../src/types'

const mockShops: Shop[] = [
  {
    id: '1',
    name: '老灶火锅',
    category: 'hotpot',
    district: 'yuzhong',
    address: '渝中区解放碑某巷',
    description: '正宗老火锅，麻辣鲜香',
    avgPrice: 85,
    recommendDishes: ['毛肚', '鸭肠', '老肉片'],
    businessHours: '11:00-23:00',
    location: { lng: 106.5789, lat: 29.5584 },
  },
  {
    id: '2',
    name: '胖妹面庄',
    category: 'noodles',
    district: 'yuzhong',
    address: '渝中区较场口',
    description: '重庆小面的天花板',
    avgPrice: 15,
    recommendDishes: ['豌杂面', '牛肉面'],
    businessHours: '06:00-14:00',
    location: { lng: 106.5810, lat: 29.5560 },
  },
  {
    id: '3',
    name: '何王氏串串',
    category: 'chuanchuan',
    district: 'jiangbei',
    address: '江北区观音桥',
    description: '串串香老店',
    avgPrice: 60,
    recommendDishes: ['牛肉串', '脑花'],
    businessHours: '16:00-02:00',
    location: { lng: 106.5743, lat: 29.6063 },
  },
]

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useShops', () => {
  it('fetches and returns shops data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ shops: mockShops }),
    } as Response)

    const { result } = renderHook(() => useShops())

    expect(result.current.loading).toBe(true)

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.shops).toHaveLength(3)
    expect(result.current.shops[0].name).toBe('老灶火锅')
  })

  it('filters shops by district', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ shops: mockShops }),
    } as Response)

    const { result } = renderHook(() => useShops())

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    act(() => {
      result.current.setDistrict('yuzhong')
    })

    expect(result.current.filteredShops).toHaveLength(2)
    expect(result.current.filteredShops.every((s) => s.district === 'yuzhong')).toBe(true)
  })

  it('filters shops by category', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ shops: mockShops }),
    } as Response)

    const { result } = renderHook(() => useShops())

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    act(() => {
      result.current.setCategory('hotpot')
    })

    expect(result.current.filteredShops).toHaveLength(1)
    expect(result.current.filteredShops[0].category).toBe('hotpot')
  })

  it('filters shops by search query', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ shops: mockShops }),
    } as Response)

    const { result } = renderHook(() => useShops())

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    act(() => {
      result.current.setSearch('火锅')
    })

    expect(result.current.filteredShops).toHaveLength(1)
    expect(result.current.filteredShops[0].name).toBe('老灶火锅')
  })

  it('handles fetch error gracefully', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useShops())

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.shops).toHaveLength(0)
    expect(result.current.error).toBe('Network error')
  })
})
