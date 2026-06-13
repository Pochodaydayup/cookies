import type { Shop } from '../../types'
import { CATEGORIES, DISTRICTS } from '../../constants'
import { MapPin } from 'lucide-react'
import styles from './ShopListItem.module.css'

interface ShopListItemProps {
  shop: Shop
  onClick: (shop: Shop) => void
}

export function ShopListItem({ shop, onClick }: ShopListItemProps) {
  return (
    <button className={styles.item} onClick={() => onClick(shop)}>
      <div className={styles.header}>
        <span className={styles.name}>{shop.name}</span>
        <span className={styles.price}>¥{shop.avgPrice}/人</span>
      </div>
      <div className={styles.meta}>
        <span className={styles.categoryTag}>{CATEGORIES[shop.category]}</span>
        <span className={styles.district}>
          <MapPin size={11} style={{ marginRight: 2, verticalAlign: -1 }} />
          {DISTRICTS[shop.district]}
        </span>
      </div>
      <p className={styles.description}>{shop.description}</p>
    </button>
  )
}
