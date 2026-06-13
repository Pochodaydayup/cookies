export type CategoryKey = 'hotpot' | 'noodles' | 'chuanchuan' | 'bbq' | 'jianghu' | 'dessert' | 'other'

export type DistrictKey = 'yuzhong' | 'jiangbei' | 'nanan' | 'shapinba' | 'jiulongpo' | 'dadukou' | 'banan' | 'yubei' | 'beibei'

export interface Shop {
  id: string
  name: string
  category: CategoryKey
  district: DistrictKey
  address: string
  description: string
  avgPrice: number
  recommendDishes: string[]
  businessHours: string
  location: {
    lng: number
    lat: number
  }
}

export interface ShopsData {
  shops: Shop[]
}

export type TabKey = 'map' | 'list' | 'about'
