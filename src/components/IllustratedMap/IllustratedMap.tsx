import type { DistrictKey } from '../../types'
import { DISTRICTS } from '../../constants'
import styles from './IllustratedMap.module.css'

interface IllustratedMapProps {
  onDistrictClick: (district: DistrictKey) => void
}

const DISTRICT_ICONS: Record<DistrictKey, string> = {
  yuzhong: '🍲',
  jiangbei: '🍜',
  nanan: '🍢',
  shapinba: '🔥',
  jiulongpo: '🥘',
  dadukou: '🍺',
  banan: '🫕',
  yubei: '🥟',
  beibei: '🍖',
}

const DISTRICT_POSITIONS: Record<DistrictKey, { top: string; left: string }> = {
  yuzhong: { top: '45%', left: '47%' },
  jiangbei: { top: '35%', left: '52%' },
  nanan: { top: '58%', left: '48%' },
  shapinba: { top: '40%', left: '28%' },
  jiulongpo: { top: '52%', left: '32%' },
  dadukou: { top: '60%', left: '22%' },
  banan: { top: '72%', left: '45%' },
  yubei: { top: '25%', left: '60%' },
  beibei: { top: '15%', left: '30%' },
}

export function IllustratedMap({ onDistrictClick }: IllustratedMapProps) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>重庆美食地图</div>
      <div className={styles.subtitle}>点击区域探索本地人的秘密据点</div>
      <div className={styles.map}>
        <svg className={styles.rivers} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M 10,50 Q 30,45 50,48 Q 70,51 90,42"
            fill="none"
            stroke="rgba(0, 240, 255, 0.15)"
            strokeWidth="1.5"
          />
          <path
            d="M 15,65 Q 35,58 55,62 Q 75,66 95,55"
            fill="none"
            stroke="rgba(0, 240, 255, 0.1)"
            strokeWidth="1"
          />
        </svg>

        {(Object.entries(DISTRICTS) as [DistrictKey, string][]).map(([key, label]) => (
          <button
            key={key}
            className={styles.district}
            style={{ top: DISTRICT_POSITIONS[key].top, left: DISTRICT_POSITIONS[key].left }}
            onClick={() => onDistrictClick(key)}
          >
            <span className={styles.districtIcon}>{DISTRICT_ICONS[key]}</span>
            <span className={styles.districtLabel}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
