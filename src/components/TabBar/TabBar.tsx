import type { TabKey } from '../../types'
import styles from './TabBar.module.css'

interface TabBarProps {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
}

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'map', label: '地图', icon: '🗺️' },
  { key: 'list', label: '列表', icon: '📋' },
  { key: 'about', label: '关于', icon: '💡' },
]

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className={styles.tabBar}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.tab} ${activeTab === tab.key ? styles.active : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
