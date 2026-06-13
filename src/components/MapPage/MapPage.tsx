import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Shop, CategoryKey } from '../../types'
import { DISTRICT_CENTERS } from '../../constants'
import { CategoryBar } from '../CategoryBar/CategoryBar'
import { ShopCard } from '../ShopCard/ShopCard'
import styles from './MapPage.module.css'

interface MapPageProps {
  shops: Shop[]
  loading: boolean
  error: string | null
}

function createShopIcon() {
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

function createUserIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #3b82f6;
      border: 3px solid #fff;
      box-shadow: 0 0 0 2px rgba(59,130,246,0.3), 0 2px 6px rgba(0,0,0,0.2);
      animation: userPulse 2s ease-in-out infinite;
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function MapPage({ shops, loading, error }: MapPageProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const userMarkerRef = useRef<L.Marker | null>(null)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [nearestShops, setNearestShops] = useState<Shop[]>([])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView([29.56, 106.55], 12)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapRef.current = map

    setTimeout(() => map.invalidateSize(), 100)

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setUserLocation({ lat: latitude, lng: longitude })

          map.setView([latitude, longitude], 15)

          if (userMarkerRef.current) userMarkerRef.current.remove()
          userMarkerRef.current = L.marker([latitude, longitude], { icon: createUserIcon() })
            .addTo(map)
            .bindTooltip('我的位置', { direction: 'top', offset: [0, -12] })
        },
        () => {
          // Geolocation failed — stay on default CQ center
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update nearest shops when user location or shops change
  useEffect(() => {
    if (!userLocation || shops.length === 0) {
      setNearestShops([])
      return
    }

    const sorted = [...shops]
      .map((shop) => ({
        shop,
        dist: getDistance(userLocation.lat, userLocation.lng, shop.location.lat, shop.location.lng),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5)
      .map((item) => item.shop)

    setNearestShops(sorted)
  }, [userLocation, shops])

  // Update shop markers
  useEffect(() => {
    const map = mapRef.current
    if (!map || shops.length === 0) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const filtered = activeCategory
      ? shops.filter((s) => s.category === activeCategory)
      : shops

    const icon = createShopIcon()

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

    // If user has location, re-center on user after showing markers
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 15)
    }
  }, [shops, activeCategory, userLocation])

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
    <div className={styles.container}>
      <div className={styles.topBar}>
        <CategoryBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      </div>
      <div ref={mapContainerRef} className={styles.map} />

      {nearestShops.length > 0 && (
        <div className={styles.nearestPanel}>
          <div className={styles.nearestTitle}>📍 离你最近的店</div>
          <div className={styles.nearestList}>
            {nearestShops.slice(0, 3).map((shop, i) => (
              <button
                key={shop.id}
                className={styles.nearestItem}
                onClick={() => {
                  setSelectedShop(shop)
                  mapRef.current?.setView([shop.location.lat, shop.location.lng], 17)
                }}
              >
                <span className={styles.nearestIndex}>{i + 1}</span>
                <div className={styles.nearestInfo}>
                  <span className={styles.nearestName}>{shop.name}</span>
                  <span className={styles.nearestAddr}>{shop.address}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedShop && (
        <ShopCard shop={selectedShop} onClose={() => setSelectedShop(null)} />
      )}
    </div>
  )
}
