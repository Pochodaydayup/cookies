import { useState } from 'react'
import type { TabKey, Shop } from './types'
import { TabBar } from './components/TabBar/TabBar'
import { MapPage } from './components/MapPage/MapPage'
import { ListPage } from './components/ListPage/ListPage'
import { AboutPage } from './components/AboutPage/AboutPage'
import { ShopCard } from './components/ShopCard/ShopCard'
import { useShops } from './hooks/useShops'
import './styles/global.css'

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('map')
  const { shops, loading, error } = useShops()
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)

  return (
    <div className="app-container">
      {/* Map is always mounted — hidden with visibility to preserve Leaflet dimensions */}
      <div className={activeTab === 'map' ? 'map-visible' : 'map-hidden'}>
        <MapPage shops={shops} loading={loading} error={error} />
      </div>

      {activeTab === 'list' && (
        <div className="app-content">
          <ListPage shops={shops} onShopClick={setSelectedShop} />
          {selectedShop && (
            <ShopCard shop={selectedShop} onClose={() => setSelectedShop(null)} />
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="app-content">
          <AboutPage />
        </div>
      )}

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App
