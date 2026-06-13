import { useState, useMemo } from 'react'
import type { Shop, DistrictKey, CategoryKey } from '../../types'
import { DISTRICTS } from '../../constants'
import { Search } from 'lucide-react'
import { CategoryBar } from '../CategoryBar/CategoryBar'
import { ShopListItem } from '../ShopListItem/ShopListItem'
import styles from './ListPage.module.css'

interface ListPageProps {
  shops: Shop[]
  onShopClick: (shop: Shop) => void
}

export function ListPage({ shops, onShopClick }: ListPageProps) {
  const [district, setDistrict] = useState<DistrictKey | null>(null)
  const [category, setCategory] = useState<CategoryKey | null>(null)
  const [search, setSearch] = useState('')

  const filteredShops = useMemo(() => {
    let result = shops
    if (district) result = result.filter((s) => s.district === district)
    if (category) result = result.filter((s) => s.category === category)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      )
    }
    return result
  }, [shops, district, category, search])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>全部店铺</h1>
        <div className={styles.searchBar}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="搜索店名、地址..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.filters}>
        <select
          className={styles.districtSelect}
          value={district ?? ''}
          onChange={(e) => setDistrict((e.target.value || null) as DistrictKey | null)}
          aria-label="选择区域"
        >
          <option value="">全部区域</option>
          {(Object.entries(DISTRICTS) as [DistrictKey, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <CategoryBar activeCategory={category} onCategoryChange={setCategory} />

      <div className={styles.list}>
        {filteredShops.length === 0 ? (
          <div className={styles.empty}>
            <p>没有找到匹配的店铺</p>
            <p className={styles.emptyHint}>试试其他关键词或筛选条件</p>
          </div>
        ) : (
          filteredShops.map((shop) => (
            <ShopListItem key={shop.id} shop={shop} onClick={onShopClick} />
          ))
        )}
      </div>
    </div>
  )
}
