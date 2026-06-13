import type { CategoryKey } from '../../types'
import { CATEGORIES } from '../../constants'
import styles from './CategoryBar.module.css'

interface CategoryBarProps {
  activeCategory: CategoryKey | null
  onCategoryChange: (category: CategoryKey | null) => void
}

export function CategoryBar({ activeCategory, onCategoryChange }: CategoryBarProps) {
  return (
    <div className={styles.categoryBar}>
      <button
        className={`${styles.tag} ${activeCategory === null ? styles.active : ''}`}
        onClick={() => onCategoryChange(null)}
      >
        全部
      </button>
      {(Object.entries(CATEGORIES) as [CategoryKey, string][]).map(([key, label]) => (
        <button
          key={key}
          className={`${styles.tag} ${activeCategory === key ? styles.active : ''}`}
          onClick={() => onCategoryChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
