import type { ListingCandidate } from '../types'

const candidates: Record<ListingCandidate['source'], Omit<ListingCandidate, 'id' | 'source' | 'sourceUrl'>> = {
  Sauto: { title: 'Škoda Octavia 2.0 TDI DSG', brand: 'Škoda', model: 'Octavia III', year: 2018, mileage: 168000, engineCode: '2.0 TDI CR', transmission: 'DSG/DCT', askingPrice: 329000, condition: 'good' },
  TipCars: { title: 'BMW 320d xDrive', brand: 'BMW', model: '320d', year: 2017, mileage: 192000, engineCode: 'B47', transmission: 'automatická', askingPrice: 395000, condition: 'average' },
  Bazoš: { title: 'Ford Focus 1.0 EcoBoost', brand: 'Ford', model: 'Focus', year: 2016, mileage: 145000, engineCode: '1.0 EcoBoost', transmission: 'manuální', askingPrice: 189000, condition: 'average' },
  Marketplace: { title: 'Toyota Corolla Hybrid', brand: 'Toyota', model: 'Corolla', year: 2020, mileage: 96000, engineCode: '2ZR-FXE Hybrid', transmission: 'CVT', askingPrice: 459000, condition: 'good' },
}

function detectSource(hostname: string): ListingCandidate['source'] | undefined {
  if (/sauto/i.test(hostname)) return 'Sauto'
  if (/tipcars/i.test(hostname)) return 'TipCars'
  if (/bazos/i.test(hostname)) return 'Bazoš'
  if (/facebook|marketplace/i.test(hostname)) return 'Marketplace'
}

export async function parseListingUrl(rawUrl: string): Promise<ListingCandidate> {
  await new Promise((resolve) => setTimeout(resolve, 650))
  let url: URL
  try { url = new URL(rawUrl) } catch { throw new Error('Zadejte platnou URL adresu inzerátu.') }
  const source = detectSource(url.hostname)
  if (!source) throw new Error('Podporujeme zatím odkazy ze Sauto, TipCars, Bazoše a Marketplace.')
  return { id: crypto.randomUUID(), source, sourceUrl: url.toString(), ...candidates[source] }
}
