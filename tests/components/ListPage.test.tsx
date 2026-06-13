import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ListPage } from '../../src/components/ListPage/ListPage'
import type { Shop } from '../../src/types'

const mockShops: Shop[] = [
  {
    id: '1',
    name: '老灶火锅',
    category: 'hotpot',
    district: 'yuzhong',
    address: '渝中区解放碑某巷12号',
    description: '正宗老火锅',
    avgPrice: 85,
    recommendDishes: ['毛肚'],
    businessHours: '11:00-23:00',
    location: { lng: 106.5789, lat: 29.5584 },
  },
  {
    id: '2',
    name: '胖妹面庄',
    category: 'noodles',
    district: 'jiangbei',
    address: '江北区观音桥',
    description: '重庆小面的天花板',
    avgPrice: 15,
    recommendDishes: ['豌杂面'],
    businessHours: '06:00-14:00',
    location: { lng: 106.5810, lat: 29.5560 },
  },
]

describe('ListPage', () => {
  it('renders shop names in list', () => {
    render(
      <ListPage
        shops={mockShops}
        onShopClick={() => {}}
      />
    )
    expect(screen.getByText('老灶火锅')).toBeInTheDocument()
    expect(screen.getByText('胖妹面庄')).toBeInTheDocument()
  })

  it('renders category bar for filtering', () => {
    render(
      <ListPage
        shops={mockShops}
        onShopClick={() => {}}
      />
    )
    expect(screen.getByText('全部')).toBeInTheDocument()
    // Use getAllByText since "火锅" appears in both CategoryBar and ShopListItem
    const hotpotElements = screen.getAllByText('火锅')
    expect(hotpotElements.length).toBeGreaterThanOrEqual(1)
  })

  it('renders district selector', () => {
    render(
      <ListPage
        shops={mockShops}
        onShopClick={() => {}}
      />
    )
    const select = screen.getByLabelText('选择区域')
    expect(select).toBeInTheDocument()
  })

  it('filters by category when category clicked', async () => {
    render(
      <ListPage
        shops={mockShops}
        onShopClick={() => {}}
      />
    )
    // Click the CategoryBar button for 火锅 (it's a <button>, not a <span>)
    const hotpotButtons = screen.getAllByRole('button', { name: '火锅' })
    await userEvent.click(hotpotButtons[0])
    expect(screen.getByText('老灶火锅')).toBeInTheDocument()
    expect(screen.queryByText('胖妹面庄')).not.toBeInTheDocument()
  })

  it('calls onShopClick when list item clicked', async () => {
    const handleClick = vi.fn()
    render(
      <ListPage
        shops={mockShops}
        onShopClick={handleClick}
      />
    )
    await userEvent.click(screen.getByText('老灶火锅'))
    expect(handleClick).toHaveBeenCalledWith(mockShops[0])
  })
})
