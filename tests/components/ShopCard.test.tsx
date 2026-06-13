import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShopCard } from '../../src/components/ShopCard/ShopCard'
import type { Shop } from '../../src/types'

const mockShop: Shop = {
  id: '1',
  name: '老灶火锅',
  category: 'hotpot',
  district: 'yuzhong',
  address: '渝中区解放碑某巷12号',
  description: '正宗老火锅，麻辣鲜香',
  avgPrice: 85,
  recommendDishes: ['毛肚', '鸭肠', '老肉片'],
  businessHours: '11:00-23:00',
  location: { lng: 106.5789, lat: 29.5584 },
}

describe('ShopCard', () => {
  it('renders shop name and description', () => {
    render(<ShopCard shop={mockShop} onClose={() => {}} />)
    expect(screen.getByText('老灶火锅')).toBeInTheDocument()
    expect(screen.getByText('正宗老火锅，麻辣鲜香')).toBeInTheDocument()
  })

  it('renders category label', () => {
    render(<ShopCard shop={mockShop} onClose={() => {}} />)
    expect(screen.getByText('火锅')).toBeInTheDocument()
  })

  it('renders address and business hours', () => {
    render(<ShopCard shop={mockShop} onClose={() => {}} />)
    expect(screen.getByText(/渝中区解放碑某巷12号/)).toBeInTheDocument()
    expect(screen.getByText(/11:00-23:00/)).toBeInTheDocument()
  })

  it('renders avg price', () => {
    render(<ShopCard shop={mockShop} onClose={() => {}} />)
    expect(screen.getByText(/85/)).toBeInTheDocument()
  })

  it('renders recommend dishes as tags', () => {
    render(<ShopCard shop={mockShop} onClose={() => {}} />)
    expect(screen.getByText('毛肚')).toBeInTheDocument()
    expect(screen.getByText('鸭肠')).toBeInTheDocument()
    expect(screen.getByText('老肉片')).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const handleClose = vi.fn()
    render(<ShopCard shop={mockShop} onClose={handleClose} />)
    await userEvent.click(screen.getByLabelText('关闭'))
    expect(handleClose).toHaveBeenCalledOnce()
  })
})
