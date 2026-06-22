import { offlineCatalog } from '../data/catalogSeed'
import type { Engine, EngineFault, Severity } from '../types'

const CACHE_KEY = 'autoscan-engine-catalog-v1'
const PAGE_SIZE = 1000

interface SupabaseEngineRow {
  id: string
  code: string | null
  brand: string
  model: string
  generation: string | null
  year_from: number | null
  year_to: number | null
  fuel: Engine['fuel'] | null
  displacement: number | null
  power_kw: number | null
  market: string | null
  vin_prefixes: string[] | null
  base_score: number
  repair_reserve: number
  faults: EngineFault[] | null
}

export interface EngineCatalogResult {
  engines: Engine[]
  source: 'supabase' | 'cache' | 'offline'
  warning?: string
}

const config = {
  url: (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, ''),
  key: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
}

function isSeverity(value: unknown): value is Severity {
  return value === 'nízká' || value === 'střední' || value === 'vysoká'
}

function validFaults(value: unknown): EngineFault[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const fault = item as Partial<EngineFault>
    if (typeof fault.name !== 'string' || !isSeverity(fault.severity)) return []
    return [{
      name: fault.name,
      probability: Number(fault.probability) || 0,
      repairCost: Number(fault.repairCost) || 0,
      severity: fault.severity,
    }]
  })
}

function fromRow(row: SupabaseEngineRow): Engine {
  return {
    id: row.id,
    code: row.code ?? undefined,
    brand: row.brand,
    model: row.model,
    generation: row.generation ?? undefined,
    yearFrom: row.year_from ?? undefined,
    yearTo: row.year_to ?? undefined,
    fuel: row.fuel ?? undefined,
    displacement: row.displacement ?? undefined,
    powerKw: row.power_kw ?? undefined,
    market: row.market ?? undefined,
    vinPrefixes: row.vin_prefixes ?? [],
    baseScore: Number(row.base_score),
    repairReserve: Number(row.repair_reserve),
    faults: validFaults(row.faults),
    riskDataStatus: row.faults?.length ? 'verified' : 'pending',
  }
}

function readCache(): Engine[] | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null')
    return Array.isArray(parsed) && parsed.length ? parsed as Engine[] : null
  } catch {
    return null
  }
}

async function fetchSupabaseCatalog(): Promise<Engine[]> {
  if (!config.url || !config.key) throw new Error('Supabase není nakonfigurovaný')
  const result: Engine[] = []

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const response = await fetch(`${config.url}/rest/v1/engines?select=*&active=eq.true&order=brand,model&offset=${offset}&limit=${PAGE_SIZE}`, {
      headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
    })
    if (!response.ok) throw new Error(`Supabase vrátil ${response.status}`)
    const rows = await response.json() as SupabaseEngineRow[]
    result.push(...rows.map(fromRow))
    if (rows.length < PAGE_SIZE) break
  }
  if (!result.length) throw new Error('Vzdálený katalog je prázdný')
  return result
}

export const engineCatalog = {
  async load(): Promise<EngineCatalogResult> {
    if (!config.url || !config.key) return { engines: offlineCatalog, source: 'offline' }
    try {
      const engines = await fetchSupabaseCatalog()
      localStorage.setItem(CACHE_KEY, JSON.stringify(engines))
      return { engines, source: 'supabase' }
    } catch (error) {
      const cached = readCache()
      const warning = error instanceof Error ? error.message : 'Katalog se nepodařilo načíst'
      if (cached) return { engines: cached, source: 'cache', warning }
      return { engines: offlineCatalog, source: 'offline', warning }
    }
  },
}
