import type { TabKey } from '../../types'
import { Map, List, Info } from 'lucide-react'
import styles from './TabBar.module.css'

interface TabBarProps {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
}

const TABS: { key: TabKey; label: string; Icon: typeof Map }[] = [
  { key: 'map', label: '地图', Icon: Map },
  { key: 'list', label: '列表', Icon: List },
  { key: 'about', label: '关于', Icon: Info },
]

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className={styles.tabBar}>
      {TABS.map(({ key, label, Icon }) => (
        <button
          key={key}
          className={`${styles.tab} ${activeTab === key ? styles.active : ''}`}
          onClick={() => onTabChange(key)}
        >
          <Icon size={18} strokeWidth={activeTab === key ? 2.2 : 1.6} />
          <span className={styles.label}>{label}</span>
        </button>
      ))}
    </nav>
  )
}
