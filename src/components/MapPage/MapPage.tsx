import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Shop, CategoryKey } from '../../types'
import { CATEGORIES, DISTRICTS } from '../../constants'
import { CategoryBar } from '../CategoryBar/CategoryBar'
import styles from './MapPage.module.css'

interface MapPageProps {
  shops: Shop[]
  loading: boolean
  error: string | null
}

function createLocationIcon(color: string = '#d42027') {
  return L.divIcon({
    className: '',
    html: `
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${color}"/>
        <circle cx="14" cy="13" r="6" fill="#fff"/>
      </svg>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  })
}

function createUserIcon() {
  return L.divIcon({
    className: '',
    html: `
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="#3b82f6"/>
        <circle cx="14" cy="13" r="6" fill="#fff"/>
      </svg>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
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
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [nearestShops, setNearestShops] = useState<Shop[]>([])

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

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setUserLocation({ lat: latitude, lng: longitude })
          map.setView([latitude, longitude], 15)

          if (userMarkerRef.current) userMarkerRef.current.remove()
          userMarkerRef.current = L.marker([latitude, longitude], { icon: createUserIcon() })
            .addTo(map)
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

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

  useEffect(() => {
    const map = mapRef.current
    if (!map || shops.length === 0) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const filtered = activeCategory
      ? shops.filter((s) => s.category === activeCategory)
      : shops

    const icon = createLocationIcon()

    filtered.forEach((shop) => {
      const popupContent = `
        <div style="
          font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
          min-width: 180px;
          padding: 2px 0;
        ">
          <div style="font-size:15px; font-weight:700; color:#1a1a2e; margin-bottom:4px;">${shop.name}</div>
          <div style="display:inline-block; padding:2px 8px; border-radius:8px; background:rgba(212,32,39,0.08); color:#d42027; font-size:11px; font-weight:600; margin-bottom:6px;">${CATEGORIES[shop.category]}</div>
          <div style="font-size:13px; color:#6b7280; margin-bottom:4px;">${DISTRICTS[shop.district]} ${shop.address}</div>
          <div style="font-size:13px; color:#1a1a2e; margin-bottom:4px;">${shop.description}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
            <span style="font-size:12px; color:#6b7280;">${shop.businessHours}</span>
            <span style="font-size:14px; font-weight:700; color:#d42027;">¥${shop.avgPrice}/人</span>
          </div>
        </div>
      `

      const marker = L.marker([shop.location.lat, shop.location.lng], { icon })
        .bindPopup(popupContent, {
          closeButton: false,
          className: styles.shopPopup,
        })
        .addTo(map)

      markersRef.current.push(marker)
    })

    if (filtered.length > 0 && !userLocation) {
      const group = L.featureGroup(markersRef.current)
      map.fitBounds(group.getBounds().pad(0.1))
    }

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
                  mapRef.current?.setView([shop.location.lat, shop.location.lng], 17)
                  const marker = markersRef.current.find(
                    (m) => m.getLatLng().lat === shop.location.lat && m.getLatLng().lng === shop.location.lng
                  )
                  marker?.openPopup()
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
    </div>
  )
}
