import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const shopsDir = join(process.cwd(), 'public/data/shops')
const outFile = join(process.cwd(), 'public/data/shops.json')

const files = readdirSync(shopsDir).filter(f => f.endsWith('.json'))
const shops = files.map(f => {
  const raw = readFileSync(join(shopsDir, f), 'utf-8')
  const shop = JSON.parse(raw)
  // Use filename (without .json) as the id
  shop.id = f.replace('.json', '')
  return shop
})

writeFileSync(outFile, JSON.stringify({ shops }, null, 2))
console.log(`Aggregated ${shops.length} shops into shops.json`)
