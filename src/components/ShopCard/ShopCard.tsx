import type { Shop } from '../../types'
import { CATEGORIES, DISTRICTS } from '../../constants'
import { MapPin, Clock, X } from 'lucide-react'
import styles from './ShopCard.module.css'

interface ShopCardProps {
  shop: Shop
  onClose: () => void
}

export function ShopCard({ shop, onClose }: ShopCardProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="关闭">
          <X size={16} />
        </button>

        <div className={styles.header}>
          <h2 className={styles.name}>{shop.name}</h2>
          <span className={styles.categoryTag}>{CATEGORIES[shop.category]}</span>
        </div>

        <p className={styles.description}>{shop.description}</p>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <MapPin size={14} className={styles.infoIcon} />
            <span className={styles.infoValue}>{DISTRICTS[shop.district]} {shop.address}</span>
          </div>
          <div className={styles.infoItem}>
            <Clock size={14} className={styles.infoIcon} />
            <span className={styles.infoValue}>{shop.businessHours}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.priceTag}>¥{shop.avgPrice}/人</span>
          </div>
        </div>

        <div className={styles.dishes}>
          <span className={styles.dishesLabel}>推荐菜品</span>
          <div className={styles.dishTags}>
            {shop.recommendDishes.map((dish) => (
              <span key={dish} className={styles.dishTag}>{dish}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
