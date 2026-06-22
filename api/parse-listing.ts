interface ApiRequest { method?: string; body?: unknown }
interface ApiResponse { status(code: number): ApiResponse; json(body: unknown): void; setHeader(name: string, value: string): void }
type Source = 'Sauto' | 'TipCars' | 'Bazoš' | 'Marketplace'
type JsonObject = Record<string, unknown>

const allowedHosts: Array<[RegExp, Source]> = [
  [/(^|\.)sauto\.cz$/i, 'Sauto'], [/(^|\.)tipcars\.com$/i, 'TipCars'], [/(^|\.)bazos\.cz$/i, 'Bazoš'],
  [/(^|\.)facebook\.com$/i, 'Marketplace'], [/(^|\.)fb\.com$/i, 'Marketplace'],
]
const brands = ['Alfa Romeo','Audi','BMW','Citroën','Dacia','Fiat','Ford','Honda','Hyundai','Jaguar','Jeep','Kia','Land Rover','Lexus','Mazda','Mercedes-Benz','Mercedes','Mini','Mitsubishi','Nissan','Opel','Peugeot','Porsche','Renault','Seat','Škoda','Skoda','Subaru','Suzuki','Tesla','Toyota','Volkswagen','Volvo']

function entities(value: string) {
  return value.replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;|&#34;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/\s+/g, ' ').trim()
}
function textOnly(html: string) { return entities(html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')) }
function meta(html: string, property: string) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const patterns = [new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)`, 'i'), new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["']`, 'i')]
  return entities(patterns.map((pattern) => html.match(pattern)?.[1]).find(Boolean) ?? '')
}
function objects(value: unknown): JsonObject[] {
  if (Array.isArray(value)) return value.flatMap(objects)
  if (!value || typeof value !== 'object') return []
  const object = value as JsonObject
  return [object, ...Object.values(object).flatMap(objects)]
}
function jsonLd(html: string) {
  const matches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  return matches.flatMap((match) => { try { return objects(JSON.parse(match[1].trim())) } catch { return [] } })
}
function stringValue(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object') { const object = value as JsonObject; return stringValue(object.name ?? object.value ?? object.valueReference) }
  return ''
}
function firstValue(objectsList: JsonObject[], keys: string[]) {
  for (const object of objectsList) for (const key of keys) { const value = stringValue(object[key]); if (value) return entities(value) }
  return ''
}
function numberFrom(value: string) { const digits = value.replace(/[^0-9]/g, ''); return digits ? Number(digits) : 0 }
function findYear(text: string) { const match = text.match(/\b(19[8-9]\d|20[0-3]\d)\b/); return match ? Number(match[1]) : 0 }
function findMileage(text: string) { const match = text.match(/(?:najeto|nájezd|tachometr|mileage)?\s*([0-9][0-9 .]{2,8})\s*km\b/i); return match ? numberFrom(match[1]) : 0 }
function findPrice(text: string) { const match = text.match(/([0-9][0-9 .]{3,10})\s*(?:Kč|CZK)\b/i); return match ? numberFrom(match[1]) : 0 }
function findTransmission(text: string) {
  if (/DSG|DCT|dvouspoj/i.test(text)) return 'DSG/DCT'
  if (/CVT|variátor/i.test(text)) return 'CVT'
  if (/automat/i.test(text)) return 'automatická'
  if (/manuál/i.test(text)) return 'manuální'
  return 'jiná'
}
function findEngine(text: string) {
  const patterns = [/\b([A-Z0-9]{2,8}\s+\d\.[0-9]\s*(?:TDI|TSI|TFSI|dCi|HDi|TDCi|CDTI|CRDi|GDI|Hybrid|EcoBoost)?)\b/i, /\b(\d\.[0-9]\s*(?:TDI|TSI|TFSI|dCi|HDi|TDCi|CDTI|CRDi|GDI|Hybrid|EcoBoost))\b/i, /\b(OM\d{3}|M\d{2,3}|N\d{2}|B\d{2}|K9K|M57)\b/i]
  return patterns.map((pattern) => text.match(pattern)?.[1]).find(Boolean)?.trim() ?? ''
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(204).json({})
  if (req.method !== 'POST') return res.status(405).json({ error: 'Použijte POST.' })
  const rawUrl = typeof req.body === 'object' && req.body ? String((req.body as JsonObject).url ?? '') : ''
  let url: URL
  try { url = new URL(rawUrl) } catch { return res.status(400).json({ error: 'Neplatná URL.' }) }
  if (url.protocol !== 'https:') return res.status(400).json({ error: 'Je povoleno pouze HTTPS.' })
  const allowed = allowedHosts.find(([pattern]) => pattern.test(url.hostname))
  if (!allowed) return res.status(400).json({ error: 'Doména není podporovaná.' })
  try {
    const response = await fetch(url.toString(), { redirect: 'follow', signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AutoScanCZ/1.1; +https://github.com/slabajiri47-gif/Autoscan-cz)', Accept: 'text/html,application/xhtml+xml', 'Accept-Language': 'cs-CZ,cs;q=0.9,en;q=0.7' } })
    if (!response.ok) return res.status(502).json({ error: `Inzerát vrátil HTTP ${response.status}.` })
    const html = (await response.text()).slice(0, 3_000_000)
    if (/Log into Facebook|Přihlásit se k Facebooku|checkpoint\/|captcha/i.test(html)) return res.status(422).json({ error: 'Marketplace vyžaduje přihlášení nebo blokuje automatické načtení. Tento odkaz nelze serverově přečíst.' })
    const structured = jsonLd(html)
    const product = structured.find((item) => /Vehicle|Car|Product/i.test(stringValue(item['@type']))) ?? structured[0] ?? {}
    const title = firstValue([product], ['name','headline']) || meta(html, 'og:title') || entities(html.match(/<title[^>]*>([^<]+)/i)?.[1] ?? '')
    const description = firstValue([product], ['description']) || meta(html, 'og:description') || meta(html, 'description')
    const pageText = `${title} ${description} ${textOnly(html).slice(0, 180000)}`
    const brand = firstValue([product], ['brand','manufacturer']) || brands.find((item) => new RegExp(`\\b${item.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(pageText)) || ''
    const model = firstValue([product], ['model','vehicleModel']) || entities(title.replace(new RegExp(brand, 'i'), '').replace(/\b(19[8-9]\d|20[0-3]\d)\b/g, '').replace(/[|–-].*$/, '').trim())
    const year = Number(firstValue([product], ['vehicleModelDate','dateVehicleFirstRegistered','productionDate'])) || findYear(pageText)
    const mileage = numberFrom(firstValue([product], ['mileageFromOdometer','mileage'])) || findMileage(pageText)
    const offers = objects(product.offers)[0] ?? {}
    const askingPrice = numberFrom(firstValue([offers, product], ['price','lowPrice'])) || findPrice(pageText)
    const engineCode = firstValue([product], ['vehicleEngine','engineDisplacement']) || findEngine(pageText)
    const transmissionText = firstValue([product], ['vehicleTransmission']) || pageText
    const missing = [['značka',brand],['model',model],['rok',year],['nájezd',mileage],['motor',engineCode],['cena',askingPrice]].filter(([, value]) => !value).map(([label]) => label)
    if (!brand && !model && !year && !askingPrice) return res.status(422).json({ error: 'Na stránce nebyla nalezena strukturovaná data inzerátu. Web pravděpodobně blokuje parser nebo načítá obsah až JavaScriptem.' })
    return res.status(200).json({ title: title || `${brand} ${model}`.trim(), brand, model, year, mileage, engineCode, transmission: findTransmission(transmissionText), askingPrice, condition: 'average', parserSource: structured.length ? 'json-ld' : 'metadata', parserWarnings: missing.length ? [`Parser nedokázal spolehlivě zjistit: ${missing.join(', ')}. Údaje před analýzou doplňte.`] : [] })
  } catch (error) {
    const message = error instanceof Error && error.name === 'TimeoutError' ? 'Načítání inzerátu vypršelo.' : 'Inzerát se nepodařilo načíst.'
    return res.status(502).json({ error: message })
  }
}
