import type { CategoryKey, DistrictKey } from './types'

export const CATEGORIES: Record<CategoryKey, string> = {
  hotpot: '火锅',
  noodles: '小面',
  chuanchuan: '串串',
  bbq: '烧烤',
  jianghu: '江湖菜',
  dessert: '甜品/冰粉',
  other: '其他',
}

export const DISTRICTS: Record<DistrictKey, string> = {
  yuzhong: '渝中区',
  jiangbei: '江北区',
  nanan: '南岸区',
  shapinba: '沙坪坝区',
  jiulongpo: '九龙坡区',
  dadukou: '大渡口区',
  banan: '巴南区',
  yubei: '渝北区',
  beibei: '北碚区',
}

export const DISTRICT_CENTERS: Record<DistrictKey, { lng: number; lat: number }> = {
  yuzhong: { lng: 106.5789, lat: 29.5584 },
  jiangbei: { lng: 106.5743, lat: 29.6063 },
  nanan: { lng: 106.5614, lat: 29.5234 },
  shapinba: { lng: 106.4582, lat: 29.5411 },
  jiulongpo: { lng: 106.5109, lat: 29.5023 },
  dadukou: { lng: 106.4826, lat: 29.4844 },
  banan: { lng: 106.5402, lat: 29.4023 },
  yubei: { lng: 106.6307, lat: 29.7182 },
  beibei: { lng: 106.3962, lat: 29.8057 },
}

export const COLORS = {
  blue: '#3B7FFF',
  blueLight: '#EBF1FF',
  blueDark: '#2B5FD9',
  red: '#E84D39',
  orange: '#FF8C1A',
  green: '#34B369',
  bg: '#F5F6FA',
  card: '#FFFFFF',
  text: '#1A1B2E',
  text2: '#6B7085',
  text3: '#A0A4B8',
  border: '#ECEEF4',
} as const
