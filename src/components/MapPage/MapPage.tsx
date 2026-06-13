import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Shop, CategoryKey } from '../../types'
import { CATEGORIES, DISTRICTS } from '../../constants'
import { CategoryBar } from '../CategoryBar/CategoryBar'
import { Navigation, Layers } from 'lucide-react'
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
      background: #DC2626;
      border: 2.5px solid #fff;
      box-shadow: 0 2px 6px rgba(220,38,38,0.35);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  })
}

function createUserIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #3B82F6;
      border: 3px solid #fff;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
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
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [nearestShops, setNearestShops] = useState<Shop[]>([])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView([29.56, 106.55], 12)

    L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      subdomains: ['1', '2', '3', '4'],
      attribution: '&copy; 高德地图',
      maxZoom: 18,
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

    const icon = createShopIcon()

    filtered.forEach((shop) => {
      const dist = userLocation
        ? getDistance(userLocation.lat, userLocation.lng, shop.location.lat, shop.location.lng)
        : null

      const popupContent = `
        <div style="font-family:'Noto Sans SC','PingFang SC',sans-serif; min-width:200px; padding:2px 0;">
          <div style="font-size:16px; font-weight:700; color:#450A0A; margin-bottom:4px;">${shop.name}</div>
          <span style="display:inline-block; padding:2px 8px; border-radius:6px; background:#FEF2F2; color:#DC2626; font-size:11px; font-weight:600; margin-bottom:8px;">${CATEGORIES[shop.category]}</span>
          ${dist !== null ? `<span style="display:inline-block; padding:2px 8px; border-radius:6px; background:#FEF9C3; color:#CA8A04; font-size:11px; font-weight:600; margin-left:4px; margin-bottom:8px;">${dist < 1 ? Math.round(dist * 1000) + 'm' : dist.toFixed(1) + 'km'}</span>` : ''}
          <div style="font-size:13px; color:#7F1D1D; margin-bottom:4px;">${DISTRICTS[shop.district]} ${shop.address}</div>
          <div style="font-size:13px; color:#450A0A; margin-bottom:6px;">${shop.description}</div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:12px; color:#9CA3AF;">${shop.businessHours}</span>
            <span style="font-size:14px; font-weight:700; color:#CA8A04;">¥${shop.avgPrice}/人</span>
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

  const handleLocateMe = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 16)
    }
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
    <div className={styles.container}>
      <div className={styles.topBar}>
        <CategoryBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      </div>
      <div ref={mapContainerRef} className={styles.map} />

      <button className={styles.locateBtn} onClick={handleLocateMe} aria-label="定位到我的位置">
        <Navigation size={18} />
      </button>

      {nearestShops.length > 0 && (
        <div className={styles.nearestPanel}>
          <div className={styles.nearestTitle}>离你最近</div>
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
                <span className={styles.nearestPrice}>¥{shop.avgPrice}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
