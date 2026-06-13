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
      <main className="app-content">
        {activeTab === 'map' && (
          <MapPage shops={shops} loading={loading} error={error} />
        )}
        {activeTab === 'list' && (
          <ListPage shops={shops} onShopClick={setSelectedShop} />
        )}
        {activeTab === 'about' && <AboutPage />}
      </main>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'list' && selectedShop && (
        <ShopCard shop={selectedShop} onClose={() => setSelectedShop(null)} />
      )}
    </div>
  )
}

export default App
