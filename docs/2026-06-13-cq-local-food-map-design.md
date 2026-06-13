# 重庆本地人才知道的吃的 — 地图 H5 设计文档

## 概述

一个赛博朋克风格的重庆本地美食地图 H5 网页，目标用户包括来重庆旅游的外地人和想找新店的本地人。通过插画地图 + 真实地图的混合交互，呈现"只有本地人才知道"的美食氛围。

## 技术栈

| 层级 | 选型 | 理由 |
|------|------|------|
| 前端框架 | Vite + React + TypeScript | 轻量 SPA，构建快 |
| 地图 | 高德地图 JS API | 国内访问稳定，免费额度大 |
| CMS | Decap CMS | Git-based，零后端依赖，独立 admin 页面 |
| 部署 | Cloudflare Pages | push 自动构建，免费额度够用 |
| 数据存储 | 仓库内 JSON 文件 | Decap CMS 读写，构建后变静态资源 |

## 架构

纯静态架构，零后端服务。

```
编辑流程：Decap CMS (/admin) → commit JSON → push → Cloudflare Pages 构建
用户访问：SPA 加载 → fetch /data/*.json → 客户端渲染 + 筛选
```

更新延迟：1-2 分钟（Cloudflare Pages 构建时间）。

## 页面结构

### 首屏 — 插画地图概览

- 赛博朋克风格手绘城市鸟瞰图，展示重庆主要区域：渝中、江北、南岸、沙坪坝、九龙坡、大渡口、巴南、渝北、北碚
- 每个区域有标志性图标（火锅、小面碗等），hover 时发光放大
- 点击区域 → 霓虹闪烁过渡动画 → 切换到该区域的真实地图视图

### 区域地图视图

- 高德真实地图，居中到选中区域
- 店铺标记点带霓虹发光效果
- 点击标记 → 弹出店铺卡片
- 顶部横滑分类标签栏（全部/火锅/小面/串串/烧烤/江湖菜/甜品等），点击过滤当前区域店铺
- 左上角返回按钮，回到插画地图

### 店铺卡片

半透明毛玻璃质感弹窗，包含：
- 店名（大号粗体）
- 类别标签
- 地址
- 一句话描述
- 人均消费
- 推荐菜品（2-3 个标签）
- 营业时间

### 底部 Tab 栏

三个入口：
1. **地图** — 插画地图/区域地图
2. **列表** — 按区域 + 类别组合筛选的店铺列表
3. **关于** — 项目介绍

### 列表页

- 顶部双筛选器：区域下拉 + 类别横滑标签
- 店铺列表卡片（紧凑版，点击跳到地图对应标记）
- 支持搜索（前端过滤店名/地址/描述）

## 视觉风格

### 配色

- 背景：近黑偏紫 `#0a0a1a`
- 霓虹洋红：`#ff2d78`（主强调色）
- 霓虹青色：`#00f0ff`（辅助强调色）
- 卡片背景：`rgba(20, 20, 40, 0.85)` + 毛玻璃
- 文字：`#e0e0e8`（主）、`#8888aa`（辅）

### 动效

- 区域切换：霓虹闪烁 + 故障风（glitch）过渡
- 标记点：呼吸发光脉冲
- 卡片弹出：从标记点位置滑入 + 缩放
- 分类切换：横滑标签带下划线霓虹跟随动画

### 字体

- 标题：粗体无衬线，有力量感
- 正文：干净易读的无衬线体

## 数据结构

### 店铺（shops.json）

```json
{
  "shops": [
    {
      "id": "string",
      "name": "string",
      "category": "hotpot | noodles | chuanchuan | bbq | jianghu | dessert | other",
      "district": "yuzhong | jiangbei | nanan | shapinba | jiulongpo | dadukou | banan | yubei | beibei",
      "address": "string",
      "description": "string",
      "avgPrice": number,
      "recommendDishes": ["string"],
      "businessHours": "string",
      "location": { "lng": number, "lat": number }
    }
  ]
}
```

### 分类定义

| key | 中文名 |
|-----|--------|
| hotpot | 火锅 |
| noodles | 小面 |
| chuanchuan | 串串 |
| bbq | 烧烤 |
| jianghu | 江湖菜 |
| dessert | 甜品/冰粉 |
| other | 其他 |

### 区域定义

| key | 中文名 |
|-----|--------|
| yuzhong | 渝中区 |
| jiangbei | 江北区 |
| nanan | 南岸区 |
| shapinba | 沙坪坝区 |
| jiulongpo | 九龙坡区 |
| dadukou | 大渡口区 |
| banan | 巴南区 |
| yubei | 渝北区 |
| beibei | 北碚区 |

## Decap CMS 配置

- 路径：`/admin`
- 后端：`git-gateway` 或 `github`（通过 Cloudflare Pages 的 Git 集成）
- 内容类型：shops collection，字段对应上述数据结构
- 媒体文件：店铺图片（可选，后期扩展）

## 关键交互流程

1. 用户打开页面 → 看到插画地图概览
2. 点击"渝中区" → 过渡动画 → 高德地图显示渝中区店铺标记
3. 点击分类标签"火锅" → 地图只显示火锅类标记
4. 点击某个标记 → 弹出店铺卡片
5. 切换到列表 Tab → 按区域+类别浏览所有店铺
6. 管理员访问 `/admin` → Decap CMS 编辑店铺数据 → 保存 → 1-2 分钟后生效

## 约束与边界

- 无后端服务，所有数据为静态 JSON
- 更新延迟 1-2 分钟，非实时
- 搜索为前端过滤，适合百级数据量
- 店铺图片暂不包含（后期可通过 R2/Cloudinary 扩展）
- 仅适配移动端 H5，桌面端做基本响应式但非优先

## 后续可扩展

- 店铺图片上传（R2 / Cloudinary）
- 用户收藏（localStorage）
- 分享功能（生成带店铺信息的分享图）
- 更多区域和店铺数据
