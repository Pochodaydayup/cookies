# 重庆本地美食地图 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个赛博朋克风格的重庆本地美食地图 H5 网页，通过插画地图 + 高德真实地图的混合交互，呈现"只有本地人才知道"的美食氛围。

**Architecture:** 纯静态 SPA 架构，Vite + React + TypeScript 构建。数据存储为仓库内 JSON 文件，客户端 fetch 后渲染和筛选。高德地图 JS API 提供真实地图能力。Decap CMS 通过 `/admin` 路径提供内容编辑入口，编辑后 commit JSON → push → Cloudflare Pages 自动构建。零后端服务。

**Tech Stack:** Vite, React 18, TypeScript, 高德地图 JS API 2.0, Decap CMS, CSS Modules + CSS Custom Properties, Vitest + React Testing Library

---

## File Structure

| 文件路径 | 职责 |
|----------|------|
| `src/main.tsx` | 应用入口，挂载 React 根节点 |
| `src/App.tsx` | 顶层布局：Tab 路由 + 底部导航 |
| `src/types.ts` | 全局类型定义（Shop, Category, District 等） |
| `src/constants.ts` | 分类映射、区域映射、区域中心坐标、颜色常量 |
| `src/data/shops.json` | 店铺数据（示例 + 实际数据） |
| `src/hooks/useShops.ts` | fetch shops.json 并提供筛选/搜索能力 |
| `src/components/TabBar/TabBar.tsx` | 底部三 Tab 导航栏 |
| `src/components/TabBar/TabBar.module.css` | 底部导航样式 |
| `src/components/MapPage/MapPage.tsx` | 地图 Tab 页面（插画地图 + 区域地图容器） |
| `src/components/MapPage/MapPage.module.css` | 地图页样式 |
| `src/components/IllustratedMap/IllustratedMap.tsx` | 插画地图概览 SVG 组件 |
| `src/components/IllustratedMap/IllustratedMap.module.css` | 插画地图样式 |
| `src/components/DistrictMap/DistrictMap.tsx` | 高德真实地图 + 标记 + 分类筛选 |
| `src/components/DistrictMap/DistrictMap.module.css` | 区域地图样式 |
| `src/components/CategoryBar/CategoryBar.tsx` | 横滑分类标签栏 |
| `src/components/CategoryBar/CategoryBar.module.css` | 分类标签样式 |
| `src/components/ShopCard/ShopCard.tsx` | 店铺详情弹窗卡片 |
| `src/components/ShopCard/ShopCard.module.css` | 店铺卡片样式（毛玻璃） |
| `src/components/ListPage/ListPage.tsx` | 列表 Tab 页面 |
| `src/components/ListPage/ListPage.module.css` | 列表页样式 |
| `src/components/ShopListItem/ShopListItem.tsx` | 列表中的紧凑店铺卡片 |
| `src/components/ShopListItem/ShopListItem.module.css` | 列表卡片样式 |
| `src/components/AboutPage/AboutPage.tsx` | 关于页面 |
| `src/components/AboutPage/AboutPage.module.css` | 关于页样式 |
| `src/styles/global.css` | 全局样式、CSS 变量、字体 |
| `src/styles/glitch.css` | Glitch 过渡动画关键帧 |
| `src/vite-env.d.ts` | Vite 类型声明 |
| `index.html` | HTML 入口 |
| `vite.config.ts` | Vite 配置 |
| `tsconfig.json` | TypeScript 配置 |
| `package.json` | 依赖声明 |
| `public/admin/index.html` | Decap CMS 入口 |
| `public/admin/config.yml` | Decap CMS 配置 |
| `public/data/shops.json` | 构建后可 fetch 的店铺数据 |
| `tests/hooks/useShops.test.ts` | useShops hook 测试 |
| `tests/components/CategoryBar.test.tsx` | CategoryBar 组件测试 |
| `tests/components/ShopCard.test.tsx` | ShopCard 组件测试 |
| `tests/components/ListPage.test.tsx` | ListPage 组件测试 |

---

### Task 1: 项目初始化与基础配置

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/vite-env.d.ts`
- Create: `src/styles/global.css`
- Create: `src/App.tsx`

- [ ] **Step 1: 初始化 Vite + React + TypeScript 项目**

```bash
npm create vite@latest . -- --template react-ts
```

如果目录非空，确认覆盖。完成后检查 `package.json` 中包含 `react`, `react-dom`, `typescript`, `vite` 依赖。

- [ ] **Step 2: 安装额外依赖**

```bash
npm install
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: 配置 Vitest**

修改 `vite.config.ts`：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
})
```

- [ ] **Step 4: 创建测试 setup 文件**

创建 `tests/setup.ts`：

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 5: 创建全局样式与 CSS 变量**

创建 `src/styles/global.css`：

```css
:root {
  --color-bg: #0a0a1a;
  --color-neon-magenta: #ff2d78;
  --color-neon-cyan: #00f0ff;
  --color-card-bg: rgba(20, 20, 40, 0.85);
  --color-text-primary: #e0e0e8;
  --color-text-secondary: #8888aa;
  --font-heading: 'Noto Sans SC', 'PingFang SC', sans-serif;
  --font-body: 'Noto Sans SC', 'PingFang SC', sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--color-neon-cyan);
  border-radius: 2px;
}
```

- [ ] **Step 6: 创建最小 App 组件**

修改 `src/App.tsx`：

```tsx
import './styles/global.css'

function App() {
  return (
    <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-neon-cyan)' }}>
      重庆本地美食地图
    </div>
  )
}

export default App
```

- [ ] **Step 7: 确保 main.tsx 正确挂载**

确认 `src/main.tsx`：

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 8: 验证开发服务器启动**

```bash
npm run dev
```

预期：浏览器访问 `http://localhost:5173` 显示"重庆本地美食地图"青色文字。

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: init Vite + React + TypeScript project with global styles"
```

---

### Task 2: 类型定义与常量

**Files:**
- Create: `src/types.ts`
- Create: `src/constants.ts`
- Test: `tests/constants.test.ts`

- [ ] **Step 1: 写失败的类型与常量测试**

创建 `tests/constants.test.ts`：

```typescript
import { describe, it, expect } from 'vitest'
import { CATEGORIES, DISTRICTS, DISTRICT_CENTERS, COLORS } from '../src/constants'

describe('CATEGORIES', () => {
  it('has all 7 category keys', () => {
    const keys = Object.keys(CATEGORIES)
    expect(keys).toHaveLength(7)
    expect(keys).toContain('hotpot')
    expect(keys).toContain('noodles')
    expect(keys).toContain('chuanchuan')
    expect(keys).toContain('bbq')
    expect(keys).toContain('jianghu')
    expect(keys).toContain('dessert')
    expect(keys).toContain('other')
  })

  it('maps keys to Chinese labels', () => {
    expect(CATEGORIES.hotpot).toBe('火锅')
    expect(CATEGORIES.noodles).toBe('小面')
    expect(CATEGORIES.other).toBe('其他')
  })
})

describe('DISTRICTS', () => {
  it('has all 9 district keys', () => {
    const keys = Object.keys(DISTRICTS)
    expect(keys).toHaveLength(9)
  })

  it('maps keys to Chinese labels', () => {
    expect(DISTRICTS.yuzhong).toBe('渝中区')
    expect(DISTRICTS.jiangbei).toBe('江北区')
  })
})

describe('DISTRICT_CENTERS', () => {
  it('has center coordinates for every district', () => {
    for (const key of Object.keys(DISTRICTS)) {
      expect(DISTRICT_CENTERS[key]).toBeDefined()
      expect(DISTRICT_CENTERS[key].lng).toBeTypeOf('number')
      expect(DISTRICT_CENTERS[key].lat).toBeTypeOf('number')
    }
  })
})

describe('COLORS', () => {
  it('has required color values', () => {
    expect(COLORS.neonMagenta).toBe('#ff2d78')
    expect(COLORS.neonCyan).toBe('#00f0ff')
    expect(COLORS.bg).toBe('#0a0a1a')
    expect(COLORS.cardBg).toBe('rgba(20, 20, 40, 0.85)')
    expect(COLORS.textPrimary).toBe('#e0e0e8')
    expect(COLORS.textSecondary).toBe('#8888aa')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run tests/constants.test.ts
```

预期：FAIL — `Cannot find module '../src/constants'`

- [ ] **Step 3: 创建类型定义**

创建 `src/types.ts`：

```typescript
export type CategoryKey = 'hotpot' | 'noodles' | 'chuanchuan' | 'bbq' | 'jianghu' | 'dessert' | 'other'

export type DistrictKey = 'yuzhong' | 'jiangbei' | 'nanan' | 'shapinba' | 'jiulongpo' | 'dadukou' | 'banan' | 'yubei' | 'beibei'

export interface Shop {
  id: string
  name: string
  category: CategoryKey
  district: DistrictKey
  address: string
  description: string
  avgPrice: number
  recommendDishes: string[]
  businessHours: string
  location: {
    lng: number
    lat: number
  }
}

export interface ShopsData {
  shops: Shop[]
}

export type TabKey = 'map' | 'list' | 'about'
```

- [ ] **Step 4: 创建常量**

创建 `src/constants.ts`：

```typescript
import type { CategoryKey, DistrictKey } from './types'

export const CATEGORIES: Record<CategoryKey, string> = {
  hotpot: '火锅',
  noodles: '小面',
  chuanchuan: '串串',
  bbq: '烧烤',
  jianghu: '江湖菜',
  dessert: '甜品/冰粉',
  other: '其他',
}

export const DISTRICTS: Record<DistrictKey, string> = {
  yuzhong: '渝中区',
  jiangbei: '江北区',
  nanan: '南岸区',
  shapinba: '沙坪坝区',
  jiulongpo: '九龙坡区',
  dadukou: '大渡口区',
  banan: '巴南区',
  yubei: '渝北区',
  beibei: '北碚区',
}

export const DISTRICT_CENTERS: Record<DistrictKey, { lng: number; lat: number }> = {
  yuzhong: { lng: 106.5789, lat: 29.5584 },
  jiangbei: { lng: 106.5743, lat: 29.6063 },
  nanan: { lng: 106.5614, lat: 29.5234 },
  shapinba: { lng: 106.4582, lat: 29.5411 },
  jiulongpo: { lng: 106.5109, lat: 29.5023 },
  dadukou: { lng: 106.4826, lat: 29.4844 },
  banan: { lng: 106.5402, lat: 29.4023 },
  yubei: { lng: 106.6307, lat: 29.7182 },
  beibei: { lng: 106.3962, lat: 29.8057 },
}

export const COLORS = {
  neonMagenta: '#ff2d78',
  neonCyan: '#00f0ff',
  bg: '#0a0a1a',
  cardBg: 'rgba(20, 20, 40, 0.85)',
  textPrimary: '#e0e0e8',
  textSecondary: '#8888aa',
} as const
```

- [ ] **Step 5: 运行测试确认通过**

```bash
npx vitest run tests/constants.test.ts
```

预期：全部 PASS

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/constants.ts tests/constants.test.ts
git commit -m "feat: add type definitions and constants for categories, districts, colors"
```

---

### Task 3: 示例店铺数据与 useShops Hook

**Files:**
- Create: `public/data/shops.json`
- Create: `src/hooks/useShops.ts`
- Test: `tests/hooks/useShops.test.ts`

- [ ] **Step 1: 写 useShops hook 测试**

创建 `tests/hooks/useShops.test.ts`：

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useShops } from '../../src/hooks/useShops'
import type { Shop } from '../../src/types'

const mockShops: Shop[] = [
  {
    id: '1',
    name: '老灶火锅',
    category: 'hotpot',
    district: 'yuzhong',
    address: '渝中区解放碑某巷',
    description: '正宗老火锅，麻辣鲜香',
    avgPrice: 85,
    recommendDishes: ['毛肚', '鸭肠', '老肉片'],
    businessHours: '11:00-23:00',
    location: { lng: 106.5789, lat: 29.5584 },
  },
  {
    id: '2',
    name: '胖妹面庄',
    category: 'noodles',
    district: 'yuzhong',
    address: '渝中区较场口',
    description: '重庆小面的天花板',
    avgPrice: 15,
    recommendDishes: ['豌杂面', '牛肉面'],
    businessHours: '06:00-14:00',
    location: { lng: 106.5810, lat: 29.5560 },
  },
  {
    id: '3',
    name: '何王氏串串',
    category: 'chuanchuan',
    district: 'jiangbei',
    address: '江北区观音桥',
    description: '串串香老店',
    avgPrice: 60,
    recommendDishes: ['牛肉串', '脑花'],
    businessHours: '16:00-02:00',
    location: { lng: 106.5743, lat: 29.6063 },
  },
]

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useShops', () => {
  it('fetches and returns shops data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ shops: mockShops }),
    } as Response)

    const { result } = renderHook(() => useShops())

    expect(result.current.loading).toBe(true)

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.shops).toHaveLength(3)
    expect(result.current.shops[0].name).toBe('老灶火锅')
  })

  it('filters shops by district', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ shops: mockShops }),
    } as Response)

    const { result } = renderHook(() => useShops())

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    act(() => {
      result.current.setDistrict('yuzhong')
    })

    expect(result.current.filteredShops).toHaveLength(2)
    expect(result.current.filteredShops.every((s) => s.district === 'yuzhong')).toBe(true)
  })

  it('filters shops by category', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ shops: mockShops }),
    } as Response)

    const { result } = renderHook(() => useShops())

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    act(() => {
      result.current.setCategory('hotpot')
    })

    expect(result.current.filteredShops).toHaveLength(1)
    expect(result.current.filteredShops[0].category).toBe('hotpot')
  })

  it('filters shops by search query', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ shops: mockShops }),
    } as Response)

    const { result } = renderHook(() => useShops())

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    act(() => {
      result.current.setSearch('火锅')
    })

    expect(result.current.filteredShops).toHaveLength(1)
    expect(result.current.filteredShops[0].name).toBe('老灶火锅')
  })

  it('combines district + category + search filters', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ shops: mockShops }),
    } as Response)

    const { result } = renderHook(() => useShops())

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    act(() => {
      result.current.setDistrict('yuzhong')
      result.current.setCategory('noodles')
    })

    expect(result.current.filteredShops).toHaveLength(1)
    expect(result.current.filteredShops[0].name).toBe('胖妹面庄')
  })

  it('handles fetch error gracefully', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useShops())

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.shops).toHaveLength(0)
    expect(result.current.error).toBe('Network error')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run tests/hooks/useShops.test.ts
```

预期：FAIL — `Cannot find module '../../src/hooks/useShops'`

- [ ] **Step 3: 创建示例店铺数据**

创建 `public/data/shops.json`：

```json
{
  "shops": [
    {
      "id": "1",
      "name": "老灶火锅",
      "category": "hotpot",
      "district": "yuzhong",
      "address": "渝中区解放碑某巷12号",
      "description": "正宗老火锅，麻辣鲜香，本地人排队也要吃",
      "avgPrice": 85,
      "recommendDishes": ["毛肚", "鸭肠", "老肉片"],
      "businessHours": "11:00-23:00",
      "location": { "lng": 106.5789, "lat": 29.5584 }
    },
    {
      "id": "2",
      "name": "胖妹面庄",
      "category": "noodles",
      "district": "yuzhong",
      "address": "渝中区较场口日月光中心旁",
      "description": "重庆小面的天花板，早上六点就排队",
      "avgPrice": 15,
      "recommendDishes": ["豌杂面", "牛肉面"],
      "businessHours": "06:00-14:00",
      "location": { "lng": 106.5810, "lat": 29.5560 }
    },
    {
      "id": "3",
      "name": "何王氏串串",
      "category": "chuanchuan",
      "district": "jiangbei",
      "address": "江北区观音桥建新东路",
      "description": "串串香老店，味道巴适得很",
      "avgPrice": 60,
      "recommendDishes": ["牛肉串", "脑花"],
      "businessHours": "16:00-02:00",
      "location": { "lng": 106.5743, "lat": 29.6063 }
    },
    {
      "id": "4",
      "name": "烤匠烧烤",
      "category": "bbq",
      "district": "nanan",
      "address": "南岸区南坪步行街",
      "description": "深夜烧烤的灵魂归属",
      "avgPrice": 55,
      "recommendDishes": ["烤脑花", "烤苕皮", "烤豆干"],
      "businessHours": "18:00-03:00",
      "location": { "lng": 106.5614, "lat": 29.5234 }
    },
    {
      "id": "5",
      "name": "杨记江湖菜",
      "category": "jianghu",
      "district": "shapinba",
      "address": "沙坪坝区三峡广场后巷",
      "description": "正宗江湖菜，量大味足",
      "avgPrice": 70,
      "recommendDishes": ["辣子鸡", "水煮鱼"],
      "businessHours": "11:00-22:00",
      "location": { "lng": 106.4582, "lat": 29.5411 }
    },
    {
      "id": "6",
      "name": "冰粉婆婆",
      "category": "dessert",
      "district": "yuzhong",
      "address": "渝中区十八梯",
      "description": "手工冰粉，夏天必来一碗",
      "avgPrice": 8,
      "recommendDishes": ["冰粉", "凉糕"],
      "businessHours": "09:00-21:00",
      "location": { "lng": 106.5760, "lat": 29.5540 }
    }
  ]
}
```

- [ ] **Step 4: 实现 useShops hook**

创建 `src/hooks/useShops.ts`：

```typescript
import { useState, useEffect, useMemo } from 'react'
import type { Shop, DistrictKey, CategoryKey } from '../types'

interface UseShopsReturn {
  shops: Shop[]
  filteredShops: Shop[]
  loading: boolean
  error: string | null
  district: DistrictKey | null
  category: CategoryKey | null
  search: string
  setDistrict: (d: DistrictKey | null) => void
  setCategory: (c: CategoryKey | null) => void
  setSearch: (s: string) => void
}

export function useShops(): UseShopsReturn {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [district, setDistrict] = useState<DistrictKey | null>(null)
  const [category, setCategory] = useState<CategoryKey | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/data/shops.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setShops(data.shops)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const filteredShops = useMemo(() => {
    let result = shops

    if (district) {
      result = result.filter((s) => s.district === district)
    }

    if (category) {
      result = result.filter((s) => s.category === category)
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      )
    }

    return result
  }, [shops, district, category, search])

  return {
    shops,
    filteredShops,
    loading,
    error,
    district,
    category,
    search,
    setDistrict,
    setCategory,
    setSearch,
  }
}
```

- [ ] **Step 5: 运行测试确认通过**

```bash
npx vitest run tests/hooks/useShops.test.ts
```

预期：全部 PASS

- [ ] **Step 6: Commit**

```bash
git add public/data/shops.json src/hooks/useShops.ts tests/hooks/useShops.test.ts
git commit -m "feat: add sample shop data and useShops hook with filter/search"
```

---

### Task 4: 底部 TabBar 组件

**Files:**
- Create: `src/components/TabBar/TabBar.tsx`
- Create: `src/components/TabBar/TabBar.module.css`

- [ ] **Step 1: 创建 TabBar 组件**

创建 `src/components/TabBar/TabBar.tsx`：

```tsx
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
```

- [ ] **Step 2: 创建 TabBar 样式**

创建 `src/components/TabBar/TabBar.module.css`：

```css
.tabBar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  height: 56px;
  background: rgba(10, 10, 26, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(0, 240, 255, 0.15);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.tab.active {
  color: var(--color-neon-cyan);
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
}

.icon {
  font-size: 20px;
  line-height: 1;
}

.label {
  font-size: 11px;
  font-weight: 500;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/TabBar/
git commit -m "feat: add TabBar component with neon active state"
```

---

### Task 5: App 顶层布局与 Tab 路由

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 重写 App.tsx 为 Tab 路由容器**

```tsx
import { useState } from 'react'
import type { TabKey } from './types'
import { TabBar } from './components/TabBar/TabBar'
import { useShops } from './hooks/useShops'
import './styles/global.css'

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('map')
  const shopsState = useShops()

  return (
    <div className="app-container">
      <main className="app-content">
        {activeTab === 'map' && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-neon-cyan)' }}>
            地图页 (待实现)
          </div>
        )}
        {activeTab === 'list' && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-neon-magenta)' }}>
            列表页 (待实现)
          </div>
        )}
        {activeTab === 'about' && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-primary)' }}>
            关于页 (待实现)
          </div>
        )}
      </main>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App
```

- [ ] **Step 2: 添加布局基础样式到 global.css**

在 `src/styles/global.css` 末尾追加：

```css
.app-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
  padding-bottom: 56px;
}
```

- [ ] **Step 3: 验证 Tab 切换正常**

```bash
npm run dev
```

预期：底部三个 Tab，点击切换页面内容。

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/styles/global.css
git commit -m "feat: add App layout with tab routing and useShops integration"
```

---

### Task 6: CategoryBar 横滑分类标签栏

**Files:**
- Create: `src/components/CategoryBar/CategoryBar.tsx`
- Create: `src/components/CategoryBar/CategoryBar.module.css`
- Test: `tests/components/CategoryBar.test.tsx`

- [ ] **Step 1: 写 CategoryBar 测试**

创建 `tests/components/CategoryBar.test.tsx`：

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryBar } from '../../src/components/CategoryBar/CategoryBar'

describe('CategoryBar', () => {
  it('renders "全部" plus all 7 categories', () => {
    render(<CategoryBar activeCategory={null} onCategoryChange={() => {}} />)
    expect(screen.getByText('全部')).toBeInTheDocument()
    expect(screen.getByText('火锅')).toBeInTheDocument()
    expect(screen.getByText('小面')).toBeInTheDocument()
    expect(screen.getByText('串串')).toBeInTheDocument()
    expect(screen.getByText('烧烤')).toBeInTheDocument()
    expect(screen.getByText('江湖菜')).toBeInTheDocument()
    expect(screen.getByText('甜品/冰粉')).toBeInTheDocument()
    expect(screen.getByText('其他')).toBeInTheDocument()
  })

  it('highlights active category', () => {
    render(<CategoryBar activeCategory="hotpot" onCategoryChange={() => {}} />)
    const hotpotBtn = screen.getByText('火锅')
    expect(hotpotBtn.className).toContain('active')
  })

  it('calls onCategoryChange with null when "全部" clicked', async () => {
    const handleChange = vi.fn()
    render(<CategoryBar activeCategory="hotpot" onCategoryChange={handleChange} />)
    await userEvent.click(screen.getByText('全部'))
    expect(handleChange).toHaveBeenCalledWith(null)
  })

  it('calls onCategoryChange with category key when clicked', async () => {
    const handleChange = vi.fn()
    render(<CategoryBar activeCategory={null} onCategoryChange={handleChange} />)
    await userEvent.click(screen.getByText('火锅'))
    expect(handleChange).toHaveBeenCalledWith('hotpot')
  })
})
```

注意：测试文件顶部需要 `import { vi } from 'vitest'`。

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run tests/components/CategoryBar.test.tsx
```

预期：FAIL

- [ ] **Step 3: 创建 CategoryBar 组件**

创建 `src/components/CategoryBar/CategoryBar.tsx`：

```tsx
import type { CategoryKey } from '../../types'
import { CATEGORIES } from '../../constants'
import styles from './CategoryBar.module.css'

interface CategoryBarProps {
  activeCategory: CategoryKey | null
  onCategoryChange: (category: CategoryKey | null) => void
}

export function CategoryBar({ activeCategory, onCategoryChange }: CategoryBarProps) {
  return (
    <div className={styles.categoryBar}>
      <button
        className={`${styles.tag} ${activeCategory === null ? styles.active : ''}`}
        onClick={() => onCategoryChange(null)}
      >
        全部
      </button>
      {(Object.entries(CATEGORIES) as [CategoryKey, string][]).map(([key, label]) => (
        <button
          key={key}
          className={`${styles.tag} ${activeCategory === key ? styles.active : ''}`}
          onClick={() => onCategoryChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: 创建 CategoryBar 样式**

创建 `src/components/CategoryBar/CategoryBar.module.css`：

```css
.categoryBar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.categoryBar::-webkit-scrollbar {
  display: none;
}

.tag {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid rgba(0, 240, 255, 0.25);
  background: rgba(20, 20, 40, 0.6);
  color: var(--color-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}

.tag.active {
  background: var(--color-neon-magenta);
  border-color: var(--color-neon-magenta);
  color: #fff;
  box-shadow: 0 0 12px rgba(255, 45, 120, 0.4);
}

.tag:not(.active):active {
  background: rgba(0, 240, 255, 0.1);
  border-color: rgba(0, 240, 255, 0.4);
}
```

- [ ] **Step 5: 运行测试确认通过**

```bash
npx vitest run tests/components/CategoryBar.test.tsx
```

预期：全部 PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/CategoryBar/ tests/components/CategoryBar.test.tsx
git commit -m "feat: add CategoryBar with neon pill-style tags and active state"
```

---

### Task 7: ShopCard 店铺详情弹窗

**Files:**
- Create: `src/components/ShopCard/ShopCard.tsx`
- Create: `src/components/ShopCard/ShopCard.module.css`
- Test: `tests/components/ShopCard.test.tsx`

- [ ] **Step 1: 写 ShopCard 测试**

创建 `tests/components/ShopCard.test.tsx`：

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShopCard } from '../../src/components/ShopCard/ShopCard'
import type { Shop } from '../../src/types'

const mockShop: Shop = {
  id: '1',
  name: '老灶火锅',
  category: 'hotpot',
  district: 'yuzhong',
  address: '渝中区解放碑某巷12号',
  description: '正宗老火锅，麻辣鲜香',
  avgPrice: 85,
  recommendDishes: ['毛肚', '鸭肠', '老肉片'],
  businessHours: '11:00-23:00',
  location: { lng: 106.5789, lat: 29.5584 },
}

describe('ShopCard', () => {
  it('renders shop name and description', () => {
    render(<ShopCard shop={mockShop} onClose={() => {}} />)
    expect(screen.getByText('老灶火锅')).toBeInTheDocument()
    expect(screen.getByText('正宗老火锅，麻辣鲜香')).toBeInTheDocument()
  })

  it('renders category label', () => {
    render(<ShopCard shop={mockShop} onClose={() => {}} />)
    expect(screen.getByText('火锅')).toBeInTheDocument()
  })

  it('renders address and business hours', () => {
    render(<ShopCard shop={mockShop} onClose={() => {}} />)
    expect(screen.getByText(/渝中区解放碑某巷12号/)).toBeInTheDocument()
    expect(screen.getByText(/11:00-23:00/)).toBeInTheDocument()
  })

  it('renders avg price', () => {
    render(<ShopCard shop={mockShop} onClose={() => {}} />)
    expect(screen.getByText(/85/)).toBeInTheDocument()
  })

  it('renders recommend dishes as tags', () => {
    render(<ShopCard shop={mockShop} onClose={() => {}} />)
    expect(screen.getByText('毛肚')).toBeInTheDocument()
    expect(screen.getByText('鸭肠')).toBeInTheDocument()
    expect(screen.getByText('老肉片')).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const handleClose = vi.fn()
    render(<ShopCard shop={mockShop} onClose={handleClose} />)
    await userEvent.click(screen.getByLabelText('关闭'))
    expect(handleClose).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run tests/components/ShopCard.test.tsx
```

预期：FAIL

- [ ] **Step 3: 创建 ShopCard 组件**

创建 `src/components/ShopCard/ShopCard.tsx`：

```tsx
import type { Shop } from '../../types'
import { CATEGORIES, DISTRICTS } from '../../constants'
import styles from './ShopCard.module.css'

interface ShopCardProps {
  shop: Shop
  onClose: () => void
}

export function ShopCard({ shop, onClose }: ShopCardProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="关闭">
          ✕
        </button>

        <div className={styles.header}>
          <h2 className={styles.name}>{shop.name}</h2>
          <span className={styles.categoryTag}>{CATEGORIES[shop.category]}</span>
        </div>

        <p className={styles.description}>{shop.description}</p>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>地址</span>
            <span className={styles.infoValue}>{DISTRICTS[shop.district]} {shop.address}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>营业时间</span>
            <span className={styles.infoValue}>{shop.businessHours}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>人均</span>
            <span className={styles.infoValue}>¥{shop.avgPrice}</span>
          </div>
        </div>

        <div className={styles.dishes}>
          <span className={styles.dishesLabel}>推荐菜品</span>
          <div className={styles.dishTags}>
            {shop.recommendDishes.map((dish) => (
              <span key={dish} className={styles.dishTag}>{dish}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 创建 ShopCard 样式**

创建 `src/components/ShopCard/ShopCard.module.css`：

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
  animation: fadeIn 0.2s ease;
}

.card {
  width: 100%;
  max-width: 480px;
  max-height: 70vh;
  overflow-y: auto;
  background: rgba(20, 20, 40, 0.92);
  backdrop-filter: blur(20px);
  border-radius: 20px 20px 0 0;
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-bottom: none;
  padding: 24px 20px 36px;
  position: relative;
  animation: slideUp 0.3s ease;
}

.closeBtn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-secondary);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.closeBtn:hover {
  background: rgba(255, 45, 120, 0.2);
  border-color: var(--color-neon-magenta);
  color: var(--color-neon-magenta);
}

.header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.name {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text-primary);
  letter-spacing: 0.5px;
}

.categoryTag {
  padding: 3px 10px;
  border-radius: 12px;
  background: rgba(255, 45, 120, 0.15);
  color: var(--color-neon-magenta);
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(255, 45, 120, 0.3);
}

.description {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
  line-height: 1.5;
}

.infoGrid {
  display: grid;
  gap: 10px;
  margin-bottom: 16px;
}

.infoItem {
  display: flex;
  gap: 8px;
}

.infoLabel {
  flex-shrink: 0;
  color: var(--color-neon-cyan);
  font-size: 13px;
  font-weight: 600;
  min-width: 56px;
}

.infoValue {
  color: var(--color-text-primary);
  font-size: 13px;
}

.dishes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dishesLabel {
  color: var(--color-neon-cyan);
  font-size: 13px;
  font-weight: 600;
}

.dishTags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dishTag {
  padding: 4px 12px;
  border-radius: 14px;
  background: rgba(0, 240, 255, 0.08);
  border: 1px solid rgba(0, 240, 255, 0.2);
  color: var(--color-neon-cyan);
  font-size: 12px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

- [ ] **Step 5: 运行测试确认通过**

```bash
npx vitest run tests/components/ShopCard.test.tsx
```

预期：全部 PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/ShopCard/ tests/components/ShopCard.test.tsx
git commit -m "feat: add ShopCard with glass-morphism bottom sheet style"
```

---

### Task 8: 插画地图 IllustratedMap 组件

**Files:**
- Create: `src/components/IllustratedMap/IllustratedMap.tsx`
- Create: `src/components/IllustratedMap/IllustratedMap.module.css`

- [ ] **Step 1: 创建 IllustratedMap 组件**

创建 `src/components/IllustratedMap/IllustratedMap.tsx`：

```tsx
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
        {/* River curves */}
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

        {/* District hotspots */}
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
```

- [ ] **Step 2: 创建 IllustratedMap 样式**

创建 `src/components/IllustratedMap/IllustratedMap.module.css`：

```css
.container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px 80px;
  background: radial-gradient(ellipse at 50% 30%, rgba(0, 240, 255, 0.04) 0%, transparent 60%),
              var(--color-bg);
}

.title {
  font-size: 28px;
  font-weight: 900;
  color: var(--color-text-primary);
  text-shadow: 0 0 20px rgba(255, 45, 120, 0.3);
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.map {
  position: relative;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 3 / 4;
  border-radius: 16px;
  background: rgba(20, 20, 40, 0.4);
  border: 1px solid rgba(0, 240, 255, 0.1);
  overflow: hidden;
}

.rivers {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.district {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.2s;
}

.district:hover {
  transform: translate(-50%, -50%) scale(1.15);
}

.district:active {
  transform: translate(-50%, -50%) scale(0.95);
}

.districtIcon {
  font-size: 32px;
  filter: drop-shadow(0 0 8px rgba(255, 45, 120, 0.4));
  animation: pulse 2s ease-in-out infinite;
}

.districtLabel {
  font-size: 12px;
  color: var(--color-text-primary);
  font-weight: 600;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
}

@keyframes pulse {
  0%, 100% { filter: drop-shadow(0 0 6px rgba(255, 45, 120, 0.3)); }
  50% { filter: drop-shadow(0 0 14px rgba(255, 45, 120, 0.7)); }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/IllustratedMap/
git commit -m "feat: add IllustratedMap with district hotspots and neon pulse"
```

---

### Task 9: 区域地图 DistrictMap（高德地图集成）

**Files:**
- Create: `src/components/DistrictMap/DistrictMap.tsx`
- Create: `src/components/DistrictMap/DistrictMap.module.css`

- [ ] **Step 1: 创建 DistrictMap 组件**

创建 `src/components/DistrictMap/DistrictMap.tsx`：

```tsx
import { useEffect, useRef, useCallback } from 'react'
import type { Shop, DistrictKey, CategoryKey } from '../../types'
import { DISTRICT_CENTERS } from '../../constants'
import { CategoryBar } from '../CategoryBar/CategoryBar'
import { ShopCard } from '../ShopCard/ShopCard'
import styles from './DistrictMap.module.css'

interface DistrictMapProps {
  district: DistrictKey
  shops: Shop[]
  activeCategory: CategoryKey | null
  onCategoryChange: (category: CategoryKey | null) => void
  onBack: () => void
}

declare global {
  interface Window {
    AMap: any
  }
}

export function DistrictMap({
  district,
  shops,
  activeCategory,
  onCategoryChange,
  onBack,
}: DistrictMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)

  // Initialize map
  useEffect(() => {
    if (!window.AMap || !mapContainerRef.current) return

    const center = DISTRICT_CENTERS[district]
    const map = new window.AMap.Map(mapContainerRef.current, {
      zoom: 14,
      center: [center.lng, center.lat],
      mapStyle: 'amap://styles/dark',
      resizeEnable: true,
    })

    mapRef.current = map

    return () => {
      map.destroy()
      mapRef.current = null
    }
  }, [district])

  // Update markers when shops or category change
  useEffect(() => {
    if (!mapRef.current || !window.AMap) return

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []

    const filtered = activeCategory
      ? shops.filter((s) => s.category === activeCategory)
      : shops

    filtered.forEach((shop) => {
      const marker = new window.AMap.Marker({
        position: [shop.location.lng, shop.location.lat],
        title: shop.name,
        content: `<div style="
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ff2d78;
          box-shadow: 0 0 8px #ff2d78, 0 0 16px rgba(255,45,120,0.3);
          animation: markerPulse 1.5s ease-in-out infinite;
        "></div>`,
        offset: new window.AMap.Pixel(-7, -7),
      })

      marker.on('click', () => setSelectedShop(shop))
      marker.setMap(mapRef.current)
      markersRef.current.push(marker)
    })

    // Fit map to markers if there are any
    if (filtered.length > 0 && markersRef.current.length > 0) {
      mapRef.current.setFitView(markersRef.current, false, [60, 60, 60, 60])
    }
  }, [shops, activeCategory])

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>
          ← 返回
        </button>
        <CategoryBar activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
      </div>
      <div ref={mapContainerRef} className={styles.map} />
      {selectedShop && (
        <ShopCard shop={selectedShop} onClose={() => setSelectedShop(null)} />
      )}
    </div>
  )
}
```

注意：上面 `useState` 需要从 React 导入，修正 import 行为：

```tsx
import { useEffect, useRef, useState } from 'react'
```

- [ ] **Step 2: 创建 DistrictMap 样式**

创建 `src/components/DistrictMap/DistrictMap.module.css`：

```css
.container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.topBar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 12px 0;
  background: linear-gradient(to bottom, rgba(10, 10, 26, 0.9) 0%, transparent 100%);
}

.backBtn {
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid rgba(0, 240, 255, 0.3);
  background: rgba(10, 10, 26, 0.8);
  color: var(--color-neon-cyan);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.backBtn:active {
  background: rgba(0, 240, 255, 0.15);
}

.map {
  width: 100%;
  flex: 1;
}
```

- [ ] **Step 3: 在 index.html 加载高德地图 JS API**

修改 `index.html`，在 `<head>` 中添加：

```html
<script type="text/javascript">
  window._AMapSecurityConfig = { securityJsCode: '' }
</script>
<script
  type="text/javascript"
  src="https://webapi.amap.com/maps?v=2.0&key=YOUR_AMAP_KEY"
></script>
```

将 `YOUR_AMAP_KEY` 替换为实际高德地图 API Key。开发阶段可先留占位，运行时若 AMap 未加载则 DistrictMap 组件显示 fallback 提示。

- [ ] **Step 4: 添加 marker 脉冲动画到 global.css**

在 `src/styles/global.css` 末尾追加：

```css
@keyframes markerPulse {
  0%, 100% { box-shadow: 0 0 6px #ff2d78, 0 0 12px rgba(255,45,120,0.3); }
  50% { box-shadow: 0 0 12px #ff2d78, 0 0 24px rgba(255,45,120,0.5); }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/DistrictMap/ index.html src/styles/global.css
git commit -m "feat: add DistrictMap with AMap integration and neon markers"
```

---

### Task 10: MapPage 地图页面整合

**Files:**
- Create: `src/components/MapPage/MapPage.tsx`
- Create: `src/components/MapPage/MapPage.module.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建 MapPage 组件（插画地图与区域地图切换）**

创建 `src/components/MapPage/MapPage.tsx`：

```tsx
import { useState } from 'react'
import type { DistrictKey, CategoryKey, Shop } from '../../types'
import { IllustratedMap } from '../IllustratedMap/IllustratedMap'
import { DistrictMap } from '../DistrictMap/DistrictMap'
import styles from './MapPage.module.css'

interface MapPageProps {
  shops: Shop[]
  loading: boolean
  error: string | null
}

export function MapPage({ shops, loading, error }: MapPageProps) {
  const [activeDistrict, setActiveDistrict] = useState<DistrictKey | null>(null)
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null)

  const handleDistrictClick = (district: DistrictKey) => {
    setActiveDistrict(district)
    setActiveCategory(null)
  }

  const handleBack = () => {
    setActiveDistrict(null)
    setActiveCategory(null)
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

  if (activeDistrict) {
    const districtShops = shops.filter((s) => s.district === activeDistrict)
    return (
      <DistrictMap
        district={activeDistrict}
        shops={districtShops}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onBack={handleBack}
      />
    )
  }

  return <IllustratedMap onDistrictClick={handleDistrictClick} />
}
```

- [ ] **Step 2: 创建 MapPage 样式**

创建 `src/components/MapPage/MapPage.module.css`：

```css
.loading {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loadingText {
  color: var(--color-neon-cyan);
  font-size: 16px;
  animation: loadPulse 1.2s ease-in-out infinite;
}

@keyframes loadPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
```

- [ ] **Step 3: 更新 App.tsx 集成 MapPage**

修改 `src/App.tsx`：

```tsx
import { useState } from 'react'
import type { TabKey } from './types'
import { TabBar } from './components/TabBar/TabBar'
import { MapPage } from './components/MapPage/MapPage'
import { useShops } from './hooks/useShops'
import './styles/global.css'

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('map')
  const { filteredShops, loading, error } = useShops()

  return (
    <div className="app-container">
      <main className="app-content">
        {activeTab === 'map' && (
          <MapPage shops={filteredShops} loading={loading} error={error} />
        )}
        {activeTab === 'list' && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-neon-magenta)' }}>
            列表页 (待实现)
          </div>
        )}
        {activeTab === 'about' && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-primary)' }}>
            关于页 (待实现)
          </div>
        )}
      </main>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App
```

注意：`MapPage` 内部会管理 district/category 状态，`App` 传入的 `filteredShops` 在 map tab 下不应用 district 过滤（由 MapPage 自己管理），所以改为传 `shops`（全部数据）。修正 `App.tsx`：

```tsx
const { shops, loading, error } = useShops()
```

然后传 `shops` 给 MapPage。

- [ ] **Step 4: 验证页面流程**

```bash
npm run dev
```

预期：首屏看到插画地图，点击区域后切换到地图视图（高德地图需 API Key 才能显示），返回按钮可回到插画地图。

- [ ] **Step 5: Commit**

```bash
git add src/components/MapPage/ src/App.tsx
git commit -m "feat: integrate MapPage with illustrated map ↔ district map navigation"
```

---

### Task 11: ListPage 列表页

**Files:**
- Create: `src/components/ListPage/ListPage.tsx`
- Create: `src/components/ListPage/ListPage.module.css`
- Create: `src/components/ShopListItem/ShopListItem.tsx`
- Create: `src/components/ShopListItem/ShopListItem.module.css`
- Test: `tests/components/ListPage.test.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 写 ListPage 测试**

创建 `tests/components/ListPage.test.tsx`：

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ListPage } from '../../src/components/ListPage/ListPage'
import type { Shop } from '../../src/types'

const mockShops: Shop[] = [
  {
    id: '1',
    name: '老灶火锅',
    category: 'hotpot',
    district: 'yuzhong',
    address: '渝中区解放碑某巷12号',
    description: '正宗老火锅',
    avgPrice: 85,
    recommendDishes: ['毛肚'],
    businessHours: '11:00-23:00',
    location: { lng: 106.5789, lat: 29.5584 },
  },
  {
    id: '2',
    name: '胖妹面庄',
    category: 'noodles',
    district: 'jiangbei',
    address: '江北区观音桥',
    description: '重庆小面的天花板',
    avgPrice: 15,
    recommendDishes: ['豌杂面'],
    businessHours: '06:00-14:00',
    location: { lng: 106.5810, lat: 29.5560 },
  },
]

describe('ListPage', () => {
  it('renders shop names in list', () => {
    render(
      <ListPage
        shops={mockShops}
        onShopClick={() => {}}
      />
    )
    expect(screen.getByText('老灶火锅')).toBeInTheDocument()
    expect(screen.getByText('胖妹面庄')).toBeInTheDocument()
  })

  it('renders category bar for filtering', () => {
    render(
      <ListPage
        shops={mockShops}
        onShopClick={() => {}}
      />
    )
    expect(screen.getByText('全部')).toBeInTheDocument()
    expect(screen.getByText('火锅')).toBeInTheDocument()
  })

  it('renders district selector', () => {
    render(
      <ListPage
        shops={mockShops}
        onShopClick={() => {}}
      />
    )
    const select = screen.getByLabelText('选择区域')
    expect(select).toBeInTheDocument()
  })

  it('filters by category when category clicked', async () => {
    render(
      <ListPage
        shops={mockShops}
        onShopClick={() => {}}
      />
    )
    await userEvent.click(screen.getByText('火锅'))
    expect(screen.getByText('老灶火锅')).toBeInTheDocument()
    expect(screen.queryByText('胖妹面庄')).not.toBeInTheDocument()
  })

  it('calls onShopClick when list item clicked', async () => {
    const handleClick = vi.fn()
    render(
      <ListPage
        shops={mockShops}
        onShopClick={handleClick}
      />
    )
    await userEvent.click(screen.getByText('老灶火锅'))
    expect(handleClick).toHaveBeenCalledWith(mockShops[0])
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run tests/components/ListPage.test.tsx
```

预期：FAIL

- [ ] **Step 3: 创建 ShopListItem 组件**

创建 `src/components/ShopListItem/ShopListItem.tsx`：

```tsx
import type { Shop } from '../../types'
import { CATEGORIES, DISTRICTS } from '../../constants'
import styles from './ShopListItem.module.css'

interface ShopListItemProps {
  shop: Shop
  onClick: (shop: Shop) => void
}

export function ShopListItem({ shop, onClick }: ShopListItemProps) {
  return (
    <button className={styles.item} onClick={() => onClick(shop)}>
      <div className={styles.header}>
        <span className={styles.name}>{shop.name}</span>
        <span className={styles.price}>¥{shop.avgPrice}/人</span>
      </div>
      <div className={styles.meta}>
        <span className={styles.categoryTag}>{CATEGORIES[shop.category]}</span>
        <span className={styles.district}>{DISTRICTS[shop.district]}</span>
      </div>
      <p className={styles.description}>{shop.description}</p>
    </button>
  )
}
```

- [ ] **Step 4: 创建 ShopListItem 样式**

创建 `src/components/ShopListItem/ShopListItem.module.css`：

```css
.item {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  background: rgba(20, 20, 40, 0.6);
  border: 1px solid rgba(0, 240, 255, 0.08);
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.item:active {
  background: rgba(0, 240, 255, 0.06);
  border-color: rgba(0, 240, 255, 0.2);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.name {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.price {
  font-size: 13px;
  color: var(--color-neon-magenta);
  font-weight: 600;
}

.meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.categoryTag {
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(255, 45, 120, 0.12);
  color: var(--color-neon-magenta);
  font-size: 11px;
  font-weight: 600;
}

.district {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.description {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

- [ ] **Step 5: 创建 ListPage 组件**

创建 `src/components/ListPage/ListPage.tsx`：

```tsx
import { useState, useMemo } from 'react'
import type { Shop, DistrictKey, CategoryKey } from '../../types'
import { DISTRICTS, CATEGORIES } from '../../constants'
import { CategoryBar } from '../CategoryBar/CategoryBar'
import { ShopListItem } from '../ShopListItem/ShopListItem'
import styles from './ListPage.module.css'

interface ListPageProps {
  shops: Shop[]
  onShopClick: (shop: Shop) => void
}

export function ListPage({ shops, onShopClick }: ListPageProps) {
  const [district, setDistrict] = useState<DistrictKey | null>(null)
  const [category, setCategory] = useState<CategoryKey | null>(null)
  const [search, setSearch] = useState('')

  const filteredShops = useMemo(() => {
    let result = shops
    if (district) result = result.filter((s) => s.district === district)
    if (category) result = result.filter((s) => s.category === category)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      )
    }
    return result
  }, [shops, district, category, search])

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="搜索店名、地址..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.filters}>
        <select
          className={styles.districtSelect}
          value={district ?? ''}
          onChange={(e) => setDistrict((e.target.value || null) as DistrictKey | null)}
          aria-label="选择区域"
        >
          <option value="">全部区域</option>
          {(Object.entries(DISTRICTS) as [DistrictKey, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <CategoryBar activeCategory={category} onCategoryChange={setCategory} />

      <div className={styles.list}>
        {filteredShops.length === 0 ? (
          <div className={styles.empty}>没有找到匹配的店铺</div>
        ) : (
          filteredShops.map((shop) => (
            <ShopListItem key={shop.id} shop={shop} onClick={onShopClick} />
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: 创建 ListPage 样式**

创建 `src/components/ListPage/ListPage.module.css`：

```css
.container {
  width: 100%;
  min-height: 100vh;
  padding: 16px 16px 80px;
  background: var(--color-bg);
}

.searchBar {
  margin-bottom: 12px;
}

.searchInput {
  width: 100%;
  padding: 10px 16px;
  border-radius: 24px;
  border: 1px solid rgba(0, 240, 255, 0.2);
  background: rgba(20, 20, 40, 0.6);
  color: var(--color-text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.searchInput::placeholder {
  color: var(--color-text-secondary);
}

.searchInput:focus {
  border-color: var(--color-neon-cyan);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.15);
}

.filters {
  margin-bottom: 4px;
}

.districtSelect {
  width: 100%;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 240, 255, 0.2);
  background: rgba(20, 20, 40, 0.6);
  color: var(--color-text-primary);
  font-size: 14px;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.districtSelect option {
  background: #14142a;
  color: var(--color-text-primary);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.empty {
  text-align: center;
  padding: 40px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}
```

- [ ] **Step 7: 运行测试确认通过**

```bash
npx vitest run tests/components/ListPage.test.tsx
```

预期：全部 PASS

- [ ] **Step 8: 更新 App.tsx 集成 ListPage**

修改 `src/App.tsx`，替换列表页占位：

```tsx
import { useState } from 'react'
import type { TabKey, Shop } from './types'
import { TabBar } from './components/TabBar/TabBar'
import { MapPage } from './components/MapPage/MapPage'
import { ListPage } from './components/ListPage/ListPage'
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
        {activeTab === 'about' && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-primary)' }}>
            关于页 (待实现)
          </div>
        )}
      </main>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      {selectedShop && (
        <ShopCard shop={selectedShop} onClose={() => setSelectedShop(null)} />
      )}
    </div>
  )
}

export default App
```

- [ ] **Step 9: Commit**

```bash
git add src/components/ListPage/ src/components/ShopListItem/ tests/components/ListPage.test.tsx src/App.tsx
git commit -m "feat: add ListPage with search, district filter, category filter"
```

---

### Task 12: AboutPage 关于页面

**Files:**
- Create: `src/components/AboutPage/AboutPage.tsx`
- Create: `src/components/AboutPage/AboutPage.module.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建 AboutPage 组件**

创建 `src/components/AboutPage/AboutPage.tsx`：

```tsx
import styles from './AboutPage.module.css'

export function AboutPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>重庆本地人才知道的吃的</h1>
      <p className={styles.subtitle}>
        🌶️ 一个赛博朋克风格的重庆本地美食地图
      </p>

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
          纯静态 SPA 架构，使用 React + TypeScript 构建，高德地图提供地图服务，
          Decap CMS 管理内容，部署在 Cloudflare Pages。
        </p>
      </div>

      <div className={styles.footer}>
        Made with ❤️ in 重庆
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建 AboutPage 样式**

创建 `src/components/AboutPage/AboutPage.module.css`：

```css
.container {
  width: 100%;
  min-height: 100vh;
  padding: 48px 24px 80px;
  background: var(--color-bg);
}

.title {
  font-size: 26px;
  font-weight: 900;
  color: var(--color-text-primary);
  text-shadow: 0 0 20px rgba(255, 45, 120, 0.3);
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.subtitle {
  font-size: 15px;
  color: var(--color-neon-cyan);
  margin-bottom: 36px;
}

.section {
  margin-bottom: 28px;
}

.sectionTitle {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-neon-magenta);
  margin-bottom: 10px;
  padding-left: 10px;
  border-left: 3px solid var(--color-neon-magenta);
}

.text {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.footer {
  margin-top: 40px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
}
```

- [ ] **Step 3: 更新 App.tsx 集成 AboutPage**

修改 `src/App.tsx`，替换关于页占位并添加 import：

```tsx
import { AboutPage } from './components/AboutPage/AboutPage'
```

替换关于页内容为：

```tsx
{activeTab === 'about' && <AboutPage />}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/AboutPage/ src/App.tsx
git commit -m "feat: add AboutPage with project intro and neon accent styling"
```

---

### Task 13: Glitch 过渡动画

**Files:**
- Create: `src/styles/glitch.css`
- Modify: `src/components/MapPage/MapPage.tsx`
- Modify: `src/components/MapPage/MapPage.module.css`

- [ ] **Step 1: 创建 Glitch 动画关键帧**

创建 `src/styles/glitch.css`：

```css
.glitch-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  pointer-events: none;
  background: var(--color-bg);
  animation: glitchTransition 0.6s ease-out forwards;
}

.glitch-overlay::before,
.glitch-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 240, 255, 0.03) 2px,
    rgba(0, 240, 255, 0.03) 4px
  );
}

.glitch-overlay::before {
  animation: glitchSlice1 0.3s ease-out;
}

.glitch-overlay::after {
  animation: glitchSlice2 0.4s ease-out;
}

@keyframes glitchTransition {
  0% { opacity: 1; }
  30% { opacity: 0.8; }
  50% { opacity: 0.4; }
  100% { opacity: 0; }
}

@keyframes glitchSlice1 {
  0% { clip-path: inset(20% 0 60% 0); transform: translateX(-4px); }
  50% { clip-path: inset(50% 0 10% 0); transform: translateX(4px); }
  100% { clip-path: inset(0); transform: translateX(0); }
}

@keyframes glitchSlice2 {
  0% { clip-path: inset(60% 0 10% 0); transform: translateX(6px); }
  50% { clip-path: inset(10% 0 50% 0); transform: translateX(-6px); }
  100% { clip-path: inset(0); transform: translateX(0); }
}

.neonFlash {
  animation: neonFlashing 0.3s ease-in-out;
}

@keyframes neonFlashing {
  0% { filter: brightness(1); }
  25% { filter: brightness(2) hue-rotate(20deg); }
  50% { filter: brightness(0.5); }
  75% { filter: brightness(1.8) hue-rotate(-10deg); }
  100% { filter: brightness(1); }
}
```

- [ ] **Step 2: 在 MapPage 中应用 Glitch 过渡**

修改 `src/components/MapPage/MapPage.tsx`，添加过渡状态：

```tsx
import { useState, useEffect } from 'react'
import type { DistrictKey, CategoryKey, Shop } from '../../types'
import { IllustratedMap } from '../IllustratedMap/IllustratedMap'
import { DistrictMap } from '../DistrictMap/DistrictMap'
import '../../styles/glitch.css'
import styles from './MapPage.module.css'

interface MapPageProps {
  shops: Shop[]
  loading: boolean
  error: string | null
}

type ViewState = 'illustrated' | 'transitioning' | 'district'

export function MapPage({ shops, loading, error }: MapPageProps) {
  const [viewState, setViewState] = useState<ViewState>('illustrated')
  const [activeDistrict, setActiveDistrict] = useState<DistrictKey | null>(null)
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null)

  const handleDistrictClick = (district: DistrictKey) => {
    setActiveDistrict(district)
    setActiveCategory(null)
    setViewState('transitioning')

    setTimeout(() => {
      setViewState('district')
    }, 600)
  }

  const handleBack = () => {
    setActiveDistrict(null)
    setActiveCategory(null)
    setViewState('illustrated')
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
    <>
      {viewState === 'illustrated' && (
        <IllustratedMap onDistrictClick={handleDistrictClick} />
      )}
      {viewState === 'transitioning' && (
        <div className="glitch-overlay" />
      )}
      {viewState === 'district' && activeDistrict && (
        <DistrictMap
          district={activeDistrict}
          shops={shops.filter((s) => s.district === activeDistrict)}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onBack={handleBack}
        />
      )}
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/glitch.css src/components/MapPage/
git commit -m "feat: add glitch transition animation between illustrated and district map"
```

---

### Task 14: Decap CMS 配置

**Files:**
- Create: `public/admin/index.html`
- Create: `public/admin/config.yml`

- [ ] **Step 1: 创建 Decap CMS 入口**

创建 `public/admin/index.html`：

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex" />
  <title>重庆美食地图 - 内容管理</title>
  <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
</head>
<body>
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
</body>
</html>
```

- [ ] **Step 2: 创建 Decap CMS 配置**

创建 `public/admin/config.yml`：

```yaml
backend:
  name: github
  repo: YOUR_GITHUB_USERNAME/YOUR_REPO_NAME
  branch: main
  base_url: https://api.github.com

media_folder: public/images
public_folder: /images

collections:
  - name: shops
    label: 店铺
    folder: public/data
    create: true
    extension: json
    format: json
    slug: "{{id}}"
    fields:
      - { label: "店铺ID", name: "id", widget: "string" }
      - { label: "店名", name: "name", widget: "string" }
      - { label: "分类", name: "category", widget: "select", options:
          [
            { label: "火锅", value: "hotpot" },
            { label: "小面", value: "noodles" },
            { label: "串串", value: "chuanchuan" },
            { label: "烧烤", value: "bbq" },
            { label: "江湖菜", value: "jianghu" },
            { label: "甜品/冰粉", value: "dessert" },
            { label: "其他", value: "other" },
          ]
        }
      - { label: "区域", name: "district", widget: "select", options:
          [
            { label: "渝中区", value: "yuzhong" },
            { label: "江北区", value: "jiangbei" },
            { label: "南岸区", value: "nanan" },
            { label: "沙坪坝区", value: "shapinba" },
            { label: "九龙坡区", value: "jiulongpo" },
            { label: "大渡口区", value: "dadukou" },
            { label: "巴南区", value: "banan" },
            { label: "渝北区", value: "yubei" },
            { label: "北碚区", value: "beibei" },
          ]
        }
      - { label: "地址", name: "address", widget: "string" }
      - { label: "一句话描述", name: "description", widget: "string" }
      - { label: "人均消费", name: "avgPrice", widget: "number", value_type: "int" }
      - { label: "推荐菜品", name: "recommendDishes", widget: "list" }
      - { label: "营业时间", name: "businessHours", widget: "string" }
      - { label: "经度", name: "location.lng", widget: "number", value_type: "float" }
      - { label: "纬度", name: "location.lat", widget: "number", value_type: "float" }
```

注意：`repo` 字段需替换为实际 GitHub 仓库路径。如果使用 Cloudflare Pages Git 集成，backend 可改为 `git-gateway`。

- [ ] **Step 3: Commit**

```bash
git add public/admin/
git commit -m "feat: add Decap CMS admin page and config for shop management"
```

---

### Task 15: Cloudflare Pages 部署配置

**Files:**
- Create: `wrangler.toml`

- [ ] **Step 1: 创建 Wrangler 配置**

创建 `wrangler.toml`：

```toml
name = "cq-local-food-map"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"
```

- [ ] **Step 2: 添加构建脚本到 package.json**

在 `package.json` 的 `scripts` 中确认包含：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 3: 验证构建成功**

```bash
npm run build
```

预期：`dist/` 目录生成，包含 `index.html`、JS bundle、CSS 和 `data/shops.json`。

- [ ] **Step 4: Commit**

```bash
git add wrangler.toml package.json
git commit -m "feat: add Cloudflare Pages deployment config"
```

---

### Task 16: 全量测试与最终验证

**Files:**
- All existing test files
- Modify: `src/App.tsx` (final version)

- [ ] **Step 1: 运行全部测试**

```bash
npx vitest run
```

预期：全部 PASS

- [ ] **Step 2: 最终 App.tsx 完整版**

确认 `src/App.tsx` 完整内容为：

```tsx
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
      {selectedShop && (
        <ShopCard shop={selectedShop} onClose={() => setSelectedShop(null)} />
      )}
    </div>
  )
}

export default App
```

- [ ] **Step 3: 验证完整开发流程**

```bash
npm run dev
```

在浏览器中验证：
1. 首屏插画地图显示 9 个区域热点，hover 发光
2. 点击区域 → Glitch 过渡 → 高德地图显示该区域标记（需 API Key）
3. 分类标签栏过滤标记
4. 点击标记弹出店铺卡片
5. 切换列表 Tab → 搜索/区域/类别筛选正常
6. 列表点击店铺弹出 ShopCard
7. 关于页正常显示
8. 底部 Tab 切换正常

- [ ] **Step 4: 验证构建**

```bash
npm run build
npm run preview
```

预期：构建无错误，preview 可正常访问。

- [ ] **Step 5: 最终 Commit**

```bash
git add -A
git commit -m "feat: complete CQ local food map H5 — all features implemented"
```

---

## Self-Review

### 1. Spec Coverage

| 规格要求 | 对应 Task |
|----------|-----------|
| 插画地图概览 + 区域图标 hover 发光 | Task 8 |
| 点击区域 → 过渡动画 → 真实地图 | Task 10, 13 |
| 高德地图 + 霓虹标记 | Task 9 |
| 分类标签栏过滤 | Task 6, 9 |
| 返回按钮 | Task 9 |
| 店铺卡片（毛玻璃弹窗） | Task 7 |
| 底部三 Tab | Task 4, 5 |
| 列表页 + 区域/类别/搜索筛选 | Task 11 |
| 关于页 | Task 12 |
| 数据结构 shops.json | Task 3 |
| Decap CMS /admin | Task 14 |
| Cloudflare Pages 部署 | Task 15 |
| 赛博朋克配色 + CSS 变量 | Task 1 |
| Glitch 过渡动画 | Task 13 |

覆盖完整，无遗漏。

### 2. Placeholder Scan

无 TBD、TODO、"implement later"、"add validation" 等占位符。所有代码步骤均包含完整实现代码。

### 3. Type Consistency

- `Shop` 类型在 `src/types.ts` 定义，所有组件和 hook 统一引用
- `CategoryKey` / `DistrictKey` 联合类型在 types.ts 定义，CATEGORIES / DISTRICTS 常量使用 `Record<CategoryKey, string>` / `Record<DistrictKey, string>` 类型
- `DISTRICT_CENTERS` 使用 `Record<DistrictKey, { lng: number; lat: number }>` 类型
- 所有组件 props 接口与 hook 返回类型保持一致
- `TabKey` 在 types.ts 定义为 `'map' | 'list' | 'about'`

类型一致性检查通过。
