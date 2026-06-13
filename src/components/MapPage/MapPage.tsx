import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Shop, CategoryKey } from '../../types';
import { CATEGORIES, DISTRICTS } from '../../constants';
import { Search, Navigation, ChevronDown, X } from 'lucide-react';
import styles from './MapPage.module.css';

interface MapPageProps {
  shops: Shop[];
  loading: boolean;
  error: string | null;
}

const CATEGORY_COLORS: Record<CategoryKey, string> = {
  hotpot: '#E84D39',
  noodles: '#FF8C1A',
  chuanchuan: '#3B7FFF',
  bbq: '#9B59B6',
  jianghu: '#34B369',
  dessert: '#E91E8C',
  other: '#6B7085',
};

function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function MapPage({ shops, loading, error }: MapPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(
    null
  );
  const [search, setSearch] = useState('');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const filteredShops = useMemo(() => {
    let result = shops;
    if (activeCategory)
      result = result.filter((s) => s.category === activeCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [shops, activeCategory, search]);

  const nearestShops = useMemo(() => {
    if (!userLocation || shops.length === 0) return [];
    return [...shops]
      .map((shop) => ({
        shop,
        dist: getDistance(
          userLocation.lat,
          userLocation.lng,
          shop.location.lat,
          shop.location.lng
        ),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5)
      .map((i) => i.shop);
  }, [userLocation, shops]);

  // Always render the map container, init Leaflet once
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (mapRef.current) return;

    const map = L.map(el, { zoomControl: false, zoomSnap: 0.5 }).setView(
      [29.56, 106.55],
      11.5
    );
    L.tileLayer(
      'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
      {
        subdomains: ['1', '2', '3', '4'],
        detectRetina: true,
        maxZoom: 18,
      }
    ).addTo(map);
    mapRef.current = map;

    // Invalidate size after layout settles

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          if (!mapRef.current) return;
          mapRef.current.setView([latitude, longitude], 15);
          if (userMarkerRef.current) userMarkerRef.current.remove();
          userMarkerRef.current = L.marker([latitude, longitude], {
            icon: L.divIcon({
              className: '',
              html: '<div style="width:12px;height:12px;border-radius:50%;background:#3B7FFF;border:2.5px solid #fff;box-shadow:0 0 0 3px rgba(59,127,255,0.2);"></div>',
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            }),
          }).addTo(mapRef.current);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Place markers when shops arrive
  useEffect(() => {
    const map = mapRef.current;
    if (!map || shops.length === 0) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredShops.forEach((shop) => {
      const color = CATEGORY_COLORS[shop.category];
      const dist = userLocation
        ? getDistance(
            userLocation.lat,
            userLocation.lng,
            shop.location.lat,
            shop.location.lng
          )
        : null;

      L.marker([shop.location.lat, shop.location.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.2);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
          popupAnchor: [0, -10],
        }),
      })
        .bindPopup(
          `
          <div style="font-family:var(--font);min-width:180px;">
            <div style="font-size:15px;font-weight:700;color:#1A1B2E;margin-bottom:4px;">${shop.name}</div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px;">
              <span style="padding:1px 6px;border-radius:4px;background:${color}14;color:${color};font-size:11px;font-weight:600;">${CATEGORIES[shop.category]}</span>
              ${dist !== null ? `<span style="padding:1px 6px;border-radius:4px;background:#F0F1F5;color:#6B7085;font-size:11px;">${dist < 1 ? Math.round(dist * 1000) + 'm' : dist.toFixed(1) + 'km'}</span>` : ''}
            </div>
            <div style="font-size:12px;color:#6B7085;margin-bottom:3px;">${DISTRICTS[shop.district]} ${shop.address}</div>
            <div style="font-size:12px;color:#1A1B2E;margin-bottom:6px;">${shop.description}</div>
            <div style="display:flex;justify-content:space-between;">
              <span style="font-size:11px;color:#A0A4B8;">${shop.businessHours}</span>
              <span style="font-size:13px;font-weight:700;color:#E84D39;">¥${shop.avgPrice}/人</span>
            </div>
          </div>`,
          { closeButton: false, className: styles.popup }
        )
        .addTo(map);
    });
  }, [filteredShops, userLocation]);

  const handleLocate = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.invalidateSize();
      mapRef.current.setView([userLocation.lat, userLocation.lng], 16);
    }
  };

  const handleShopClick = (shop: Shop) => {
    setSelectedShop(shop);
    mapRef.current?.invalidateSize();
    mapRef.current?.setView([shop.location.lat, shop.location.lng], 17);
    const marker = markersRef.current.find(
      (m) =>
        m.getLatLng().lat === shop.location.lat &&
        m.getLatLng().lng === shop.location.lng
    );
    marker?.openPopup();
  };

  return (
    <div className={styles.page}>
      {/* Map container is ALWAYS rendered — never conditionally removed */}
      <div ref={containerRef} className={styles.map} />

      {/* Loading / error overlay on top of the map */}
      {loading && (
        <div className={styles.overlay}>
          <span className={styles.overlayText}>加载中...</span>
        </div>
      )}
      {error && (
        <div className={styles.overlay}>
          <span className={styles.overlayText}>加载失败: {error}</span>
        </div>
      )}

      <div className={styles.searchBar} onClick={() => setShowSearch(true)}>
        <Search size={15} color="#A0A4B8" />
        <span className={styles.searchPlaceholder}>{search || '搜索店铺'}</span>
        {search && (
          <button
            className={styles.clearBtn}
            onClick={(e) => {
              e.stopPropagation();
              setSearch('');
            }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {showSearch && (
        <div className={styles.searchOverlay}>
          <div className={styles.searchRow}>
            <div className={styles.searchInputWrap}>
              <Search size={15} color="#A0A4B8" />
              <input
                autoFocus
                className={styles.searchInput}
                placeholder="搜索店名、地址..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className={styles.clearBtn}
                  onClick={() => setSearch('')}
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              className={styles.cancelBtn}
              onClick={() => setShowSearch(false)}
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className={styles.categoryBar}>
        <button
          className={`${styles.cat} ${activeCategory === null ? styles.catActive : ''}`}
          onClick={() => setActiveCategory(null)}
        >
          全部
        </button>
        {(Object.entries(CATEGORIES) as [CategoryKey, string][]).map(
          ([key, label]) => (
            <button
              key={key}
              className={`${styles.cat} ${activeCategory === key ? styles.catActive : ''}`}
              onClick={() =>
                setActiveCategory(key === activeCategory ? null : key)
              }
            >
              <span
                className={styles.catDot}
                style={{ background: CATEGORY_COLORS[key] }}
              ></span>
              {label}
            </button>
          )
        )}
      </div>

      <button className={styles.locateBtn} onClick={handleLocate}>
        <Navigation size={18} color="#3B7FFF" />
      </button>

      {nearestShops.length > 0 && !selectedShop && (
        <div className={styles.bottomPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>附近推荐</span>
            <span className={styles.panelCount}>
              {filteredShops.length}家店
            </span>
          </div>
          <div className={styles.shopScroll}>
            {nearestShops.slice(0, 5).map((shop) => (
              <button
                key={shop.id}
                className={styles.shopItem}
                onClick={() => handleShopClick(shop)}
              >
                <div
                  className={styles.shopDot}
                  style={{ background: CATEGORY_COLORS[shop.category] }}
                ></div>
                <div className={styles.shopInfo}>
                  <div className={styles.shopName}>{shop.name}</div>
                  <div className={styles.shopMeta}>
                    {CATEGORIES[shop.category]} · ¥{shop.avgPrice}/人
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedShop && (
        <div
          className={styles.detailOverlay}
          onClick={() => setSelectedShop(null)}
        >
          <div
            className={styles.detailCard}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.detailClose}
              onClick={() => setSelectedShop(null)}
            >
              <ChevronDown size={20} color="#A0A4B8" />
            </button>
            <div className={styles.detailHeader}>
              <h2 className={styles.detailName}>{selectedShop.name}</h2>
              <span
                className={styles.detailCat}
                style={{
                  color: CATEGORY_COLORS[selectedShop.category],
                  background: CATEGORY_COLORS[selectedShop.category] + '14',
                }}
              >
                {CATEGORIES[selectedShop.category]}
              </span>
            </div>
            <p className={styles.detailDesc}>{selectedShop.description}</p>
            <div className={styles.detailRow}>
              <span className={styles.detailAddr}>
                {DISTRICTS[selectedShop.district]} {selectedShop.address}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailHours}>
                {selectedShop.businessHours}
              </span>
              <span className={styles.detailPrice}>
                ¥{selectedShop.avgPrice}/人
              </span>
            </div>
            <div className={styles.detailDishes}>
              {selectedShop.recommendDishes.map((d) => (
                <span key={d} className={styles.dishTag}>
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
