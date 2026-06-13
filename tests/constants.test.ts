import { describe, it, expect } from 'vitest'
import { CATEGORIES, DISTRICTS, DISTRICT_CENTERS, COLORS } from '../src/constants'

describe('CATEGORIES', () => {
  it('has all 7 category keys', () => {
    const keys = Object.keys(CATEGORIES)
    expect(keys).toHaveLength(7)
    expect(keys).toContain('hotpot')
    expect(keys).toContain('noodles')
    expect(keys).toContain('chuanchuan')
    expect(keys).toContain('bbq')
    expect(keys).toContain('jianghu')
    expect(keys).toContain('dessert')
    expect(keys).toContain('other')
  })

  it('maps keys to Chinese labels', () => {
    expect(CATEGORIES.hotpot).toBe('火锅')
    expect(CATEGORIES.noodles).toBe('小面')
    expect(CATEGORIES.other).toBe('其他')
  })
})

describe('DISTRICTS', () => {
  it('has all 9 district keys', () => {
    const keys = Object.keys(DISTRICTS)
    expect(keys).toHaveLength(9)
  })

  it('maps keys to Chinese labels', () => {
    expect(DISTRICTS.yuzhong).toBe('渝中区')
    expect(DISTRICTS.jiangbei).toBe('江北区')
  })
})

describe('DISTRICT_CENTERS', () => {
  it('has center coordinates for every district', () => {
    for (const key of Object.keys(DISTRICTS)) {
      expect(DISTRICT_CENTERS[key as keyof typeof DISTRICT_CENTERS]).toBeDefined()
      expect(DISTRICT_CENTERS[key as keyof typeof DISTRICT_CENTERS].lng).toBeTypeOf('number')
      expect(DISTRICT_CENTERS[key as keyof typeof DISTRICT_CENTERS].lat).toBeTypeOf('number')
    }
  })
})

describe('COLORS', () => {
  it('has required color values', () => {
    expect(COLORS.blue).toBe('#3B7FFF')
    expect(COLORS.blueLight).toBe('#EBF1FF')
    expect(COLORS.blueDark).toBe('#2B5FD9')
    expect(COLORS.red).toBe('#E84D39')
    expect(COLORS.orange).toBe('#FF8C1A')
    expect(COLORS.green).toBe('#34B369')
    expect(COLORS.bg).toBe('#F5F6FA')
    expect(COLORS.card).toBe('#FFFFFF')
    expect(COLORS.text).toBe('#1A1B2E')
    expect(COLORS.text2).toBe('#6B7085')
    expect(COLORS.text3).toBe('#A0A4B8')
    expect(COLORS.border).toBe('#ECEEF4')
  })
})
