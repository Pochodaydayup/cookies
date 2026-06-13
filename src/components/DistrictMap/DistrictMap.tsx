import { useEffect, useRef, useState } from 'react'
import type { Shop, DistrictKey, CategoryKey } from '../../types'
import { DISTRICT_CENTERS } from '../../constants'
import { CategoryBar } from '../CategoryBar/CategoryBar'
import { ShopCard } from '../ShopCard/ShopCard'
import styles from './DistrictMap.module.css'

interface DistrictMapProps {
  district: DistrictKey
  shops: Shop[]
  activeCategory: CategoryKey | null
  onCategoryChange: (category: CategoryKey | null) => void
  onBack: () => void
}

declare global {
  interface Window {
    AMap: any
  }
}

export function DistrictMap({
  district,
  shops,
  activeCategory,
  onCategoryChange,
  onBack,
}: DistrictMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)

  useEffect(() => {
    if (!window.AMap || !mapContainerRef.current) return

    const center = DISTRICT_CENTERS[district]
    const map = new window.AMap.Map(mapContainerRef.current, {
      zoom: 14,
      center: [center.lng, center.lat],
      mapStyle: 'amap://styles/dark',
      resizeEnable: true,
    })

    mapRef.current = map

    return () => {
      map.destroy()
      mapRef.current = null
    }
  }, [district])

  useEffect(() => {
    if (!mapRef.current || !window.AMap) return

    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []

    const filtered = activeCategory
      ? shops.filter((s) => s.category === activeCategory)
      : shops

    filtered.forEach((shop) => {
      const marker = new window.AMap.Marker({
        position: [shop.location.lng, shop.location.lat],
        title: shop.name,
        content: `<div style="
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ff2d78;
          box-shadow: 0 0 8px #ff2d78, 0 0 16px rgba(255,45,120,0.3);
        "></div>`,
        offset: new window.AMap.Pixel(-7, -7),
      })

      marker.on('click', () => setSelectedShop(shop))
      marker.setMap(mapRef.current)
      markersRef.current.push(marker)
    })

    if (filtered.length > 0 && markersRef.current.length > 0) {
      mapRef.current.setFitView(markersRef.current, false, [60, 60, 60, 60])
    }
  }, [shops, activeCategory])

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>
          ← 返回
        </button>
        <CategoryBar activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
      </div>
      {!window.AMap ? (
        <div className={styles.fallback}>
          地图加载中…请确认高德地图 API Key 已配置
        </div>
      ) : (
        <div ref={mapContainerRef} className={styles.map} />
      )}
      {selectedShop && (
        <ShopCard shop={selectedShop} onClose={() => setSelectedShop(null)} />
      )}
    </div>
  )
}
