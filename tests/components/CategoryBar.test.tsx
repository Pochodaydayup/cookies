import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryBar } from '../../src/components/CategoryBar/CategoryBar'

describe('CategoryBar', () => {
  it('renders "全部" plus all 7 categories', () => {
    render(<CategoryBar activeCategory={null} onCategoryChange={() => {}} />)
    expect(screen.getByText('全部')).toBeInTheDocument()
    expect(screen.getByText('火锅')).toBeInTheDocument()
    expect(screen.getByText('小面')).toBeInTheDocument()
    expect(screen.getByText('串串')).toBeInTheDocument()
    expect(screen.getByText('烧烤')).toBeInTheDocument()
    expect(screen.getByText('江湖菜')).toBeInTheDocument()
    expect(screen.getByText('甜品/冰粉')).toBeInTheDocument()
    expect(screen.getByText('其他')).toBeInTheDocument()
  })

  it('highlights active category', () => {
    render(<CategoryBar activeCategory="hotpot" onCategoryChange={() => {}} />)
    const hotpotBtn = screen.getByText('火锅')
    expect(hotpotBtn.className).toContain('active')
  })

  it('calls onCategoryChange with null when "全部" clicked', async () => {
    const handleChange = vi.fn()
    render(<CategoryBar activeCategory="hotpot" onCategoryChange={handleChange} />)
    await userEvent.click(screen.getByText('全部'))
    expect(handleChange).toHaveBeenCalledWith(null)
  })

  it('calls onCategoryChange with category key when clicked', async () => {
    const handleChange = vi.fn()
    render(<CategoryBar activeCategory={null} onCategoryChange={handleChange} />)
    await userEvent.click(screen.getByText('火锅'))
    expect(handleChange).toHaveBeenCalledWith('hotpot')
  })
})
