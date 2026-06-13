import { useState } from 'react'
import type { DistrictKey, CategoryKey, Shop } from '../../types'
import { IllustratedMap } from '../IllustratedMap/IllustratedMap'
import { DistrictMap } from '../DistrictMap/DistrictMap'
import '../../styles/glitch.css'
import styles from './MapPage.module.css'

interface MapPageProps {
  shops: Shop[]
  loading: boolean
  error: string | null
}

type ViewState = 'illustrated' | 'transitioning' | 'district'

export function MapPage({ shops, loading, error }: MapPageProps) {
  const [viewState, setViewState] = useState<ViewState>('illustrated')
  const [activeDistrict, setActiveDistrict] = useState<DistrictKey | null>(null)
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null)

  const handleDistrictClick = (district: DistrictKey) => {
    setActiveDistrict(district)
    setActiveCategory(null)
    setViewState('transitioning')

    setTimeout(() => {
      setViewState('district')
    }, 600)
  }

  const handleBack = () => {
    setActiveDistrict(null)
    setActiveCategory(null)
    setViewState('illustrated')
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>加载失败: {error}</div>
      </div>
    )
  }

  return (
    <>
      {viewState === 'illustrated' && (
        <IllustratedMap onDistrictClick={handleDistrictClick} />
      )}
      {viewState === 'transitioning' && (
        <div className="glitch-overlay" />
      )}
      {viewState === 'district' && activeDistrict && (
        <DistrictMap
          district={activeDistrict}
          shops={shops.filter((s) => s.district === activeDistrict)}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onBack={handleBack}
        />
      )}
    </>
  )
}
