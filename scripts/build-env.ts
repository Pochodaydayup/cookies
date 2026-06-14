// Generate worker/src/env.ts from environment variables at build time
// Usage: npx tsx scripts/build-env.ts
// Set these in Cloudflare build environment variables:
//   GITHUB_CLIENT_ID
//   GITHUB_CLIENT_SECRET

import { writeFileSync } from 'fs'

const clientId = process.env.GITHUB_CLIENT_ID || ''
const clientSecret = process.env.GITHUB_CLIENT_SECRET || ''

if (!clientId || !clientSecret) {
  console.warn('Warning: GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET not set')
}

writeFileSync('worker/src/env.ts', `// Auto-generated at build time — DO NOT commit
export const GITHUB_CLIENT_ID = '${clientId}'
export const GITHUB_CLIENT_SECRET = '${clientSecret}'
`)

console.log('Generated worker/src/env.ts')
