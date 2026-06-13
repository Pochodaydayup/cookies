import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
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

function createRedIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #d42027;
      border: 2px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

export function DistrictMap({
  district,
  shops,
  activeCategory,
  onCategoryChange,
  onBack,
}: DistrictMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    const center = DISTRICT_CENTERS[district]
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView([center.lat, center.lng], 14)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapRef.current = map

    setTimeout(() => map.invalidateSize(), 100)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [district])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const filtered = activeCategory
      ? shops.filter((s) => s.category === activeCategory)
      : shops

    const icon = createRedIcon()

    filtered.forEach((shop) => {
      const marker = L.marker([shop.location.lat, shop.location.lng], { icon })
        .on('click', () => setSelectedShop(shop))
        .addTo(map)
      markersRef.current.push(marker)
    })

    if (filtered.length > 0) {
      const group = L.featureGroup(markersRef.current)
      map.fitBounds(group.getBounds().pad(0.1))
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
      <div ref={mapContainerRef} className={styles.map} />
      {selectedShop && (
        <ShopCard shop={selectedShop} onClose={() => setSelectedShop(null)} />
      )}
    </div>
  )
}
