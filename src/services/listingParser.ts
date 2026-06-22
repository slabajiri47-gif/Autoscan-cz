import type { ListingCandidate } from '../types'

export interface ListingParseResult {
  source: ListingCandidate['source']
  sourceUrl: string
  mode: 'api' | 'manual'
  candidate?: ListingCandidate
}

export function detectListingSource(hostname: string): ListingCandidate['source'] | undefined {
  if (/sauto/i.test(hostname)) return 'Sauto'
  if (/tipcars/i.test(hostname)) return 'TipCars'
  if (/bazos/i.test(hostname)) return 'Bazoš'
  if (/facebook|marketplace/i.test(hostname)) return 'Marketplace'
}

async function parseWithApi(url: URL, source: ListingCandidate['source'], endpoint: string): Promise<ListingCandidate> {
  const key = import.meta.env.VITE_LISTING_PARSER_KEY as string | undefined
  const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(key ? { Authorization: `Bearer ${key}` } : {}) }, body: JSON.stringify({ url: url.toString(), source }) })
  if (!response.ok) { const error = await response.json().catch(() => ({})) as { error?: string }; throw new Error(error.error || `Parser API vrátilo chybu ${response.status}.`) }
  const data = await response.json() as Omit<ListingCandidate, 'id' | 'source' | 'sourceUrl'>
  return { ...data, id: crypto.randomUUID(), source, sourceUrl: url.toString() }
}

export async function parseListingUrl(rawUrl: string): Promise<ListingParseResult> {
  await new Promise((resolve) => setTimeout(resolve, 350))
  let url: URL
  try { url = new URL(rawUrl) } catch { throw new Error('Zadejte platnou URL adresu inzerátu.') }
  const source = detectListingSource(url.hostname)
  if (!source) throw new Error('Podporujeme zatím odkazy ze Sauto, TipCars, Bazoše a Marketplace.')
  const configuredEndpoint = import.meta.env.VITE_LISTING_PARSER_URL as string | undefined
  const webEndpoint = typeof window !== 'undefined' && /^https?:$/.test(window.location.protocol) ? '/api/parse-listing' : undefined
  const localEndpoint = typeof window !== 'undefined' && window.location.protocol === 'file:' ? 'http://127.0.0.1:8787/api/parse-listing' : undefined
  const builtInEndpoint = webEndpoint || localEndpoint
  const endpoint = configuredEndpoint || builtInEndpoint
  if (endpoint) {
    try { return { source, sourceUrl: url.toString(), mode: 'api', candidate: await parseWithApi(url, source, endpoint) }
    catch (error) { if (!localEndpoint || configuredEndpoint) throw error }
  }
  return { source, sourceUrl: url.toString(), mode: 'manual' }
}
