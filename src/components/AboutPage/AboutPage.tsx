import { Heart, MapPin } from 'lucide-react'
import styles from './AboutPage.module.css'

export function AboutPage() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.iconWrap}>
          <MapPin size={32} color="#3B7FFF" />
        </div>
        <h1 className={styles.title}>重庆本地人才知道的吃的</h1>
        <p className={styles.subtitle}>藏在巷子里的真味道</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>关于项目</h2>
        <p className={styles.text}>
          这个地图收集了只有重庆本地人才知道的宝藏店铺——那些藏在巷子里的老火锅、
          排队到腿软的小面馆、深夜才开门的烧烤摊。没有游客打卡店，只有真味道。
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>数据来源</h2>
        <p className={styles.text}>
          所有店铺信息来自本地人推荐，经过实地探访验证。
          如果你也有私藏好店，欢迎通过管理后台添加。
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>技术实现</h2>
        <p className={styles.text}>
          React + TypeScript 构建，Leaflet 提供地图服务，
          Decap CMS 管理内容，部署在 Cloudflare Pages。
        </p>
      </div>

      <div className={styles.footer}>
        <Heart size={14} style={{ verticalAlign: -2, marginRight: 4, color: '#E84D39' }} />
        Made in 重庆
      </div>
    </div>
  )
}
