import type { Engine, Transmission, VinDecodeResult } from '../types'

interface MockVinRecord {
  make: string
  model: string
  year: number
  engineCode: string
  transmission: Transmission
  fuel: Engine['fuel']
  mileage?: number
  owners?: number
  serviceHistory?: VinDecodeResult['serviceHistory']
}

const mockVins: Record<string, MockVinRecord> = {
  WDD2120251A043863: { make: 'Mercedes-Benz', model: 'E 350 CDI', year: 2011, engineCode: 'OM642', transmission: 'automatická', fuel: 'nafta', mileage: 218500, owners: 3, serviceHistory: 'mid' },
  TMBJG7NE8J0123456: { make: 'Škoda', model: 'Octavia III', year: 2018, engineCode: '2.0 TDI CR', transmission: 'DSG/DCT', fuel: 'nafta', mileage: 168000, owners: 2, serviceHistory: 'good' },
  WBA3D31070F123456: { make: 'BMW', model: '320d', year: 2015, engineCode: 'B47', transmission: 'automatická', fuel: 'nafta', mileage: 192000, owners: 3, serviceHistory: 'mid' },
}

export interface VinApiClient {
  decode(vin: string): Promise<VinDecodeResult>
}

function normalizeVin(vin: string) {
  return vin.trim().toUpperCase().replace(/\s/g, '')
}

function matchEngine(engines: Engine[], record: MockVinRecord) {
  const code = record.engineCode.toLocaleLowerCase('cs')
  return engines.find((engine) => (engine.code ?? engine.id).toLocaleLowerCase('cs') === code)
    ?? engines.find((engine) => `${engine.code ?? engine.id} ${engine.model}`.toLocaleLowerCase('cs').includes(code))
}

export class MockVinApiClient implements VinApiClient {
  constructor(private engines: Engine[]) {}

  async decode(rawVin: string): Promise<VinDecodeResult> {
    const vin = normalizeVin(rawVin)
    await new Promise((resolve) => setTimeout(resolve, 450))
    if (vin.length !== 17) throw new Error('VIN musí mít přesně 17 znaků.')
    const record = mockVins[vin]
    if (!record) throw new Error('VIN není v mock databázi. Zkuste WDD2120251A043863, TMBJG7NE8J0123456 nebo WBA3D31070F123456.')
    return { vin, ...record, matchedEngine: matchEngine(this.engines, record), source: 'mock' }
  }
}

class HttpVinApiClient implements VinApiClient {
  constructor(private engines: Engine[], private url: string, private apiKey: string) {}

  async decode(rawVin: string): Promise<VinDecodeResult> {
    const vin = normalizeVin(rawVin)
    const response = await fetch(`${this.url.replace(/\/$/, '')}/decode/${encodeURIComponent(vin)}`, {
      headers: { Authorization: `Bearer ${this.apiKey}`, 'X-API-Key': this.apiKey },
    })
    if (!response.ok) throw new Error(`VIN API vrátilo chybu ${response.status}.`)
    const data = await response.json() as Omit<VinDecodeResult, 'vin' | 'source' | 'matchedEngine'>
    const mockRecord: MockVinRecord = { make: data.make, model: data.model, year: data.year, engineCode: data.engineCode, transmission: data.transmission, fuel: data.fuel, mileage: data.mileage, owners: data.owners, serviceHistory: data.serviceHistory }
    return { ...data, vin, source: 'api', matchedEngine: matchEngine(this.engines, mockRecord) }
  }
}

export function createVinApiClient(engines: Engine[]): VinApiClient {
  const url = import.meta.env.VITE_VIN_API_URL as string | undefined
  const key = import.meta.env.VITE_VIN_API_KEY as string | undefined
  return url && key ? new HttpVinApiClient(engines, url, key) : new MockVinApiClient(engines)
}
