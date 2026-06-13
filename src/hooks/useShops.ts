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
