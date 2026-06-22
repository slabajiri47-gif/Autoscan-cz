import type { Engine, SavedCar, ServicePlanItem } from '../types'

function nextKm(current: number, interval: number) { return Math.ceil((current + 1) / interval) * interval }
function futureDate(months: number) { const date = new Date(); date.setMonth(date.getMonth() + months); return date.toISOString().slice(0, 10) }

export function createServicePlan(car: SavedCar, engine?: Engine): ServicePlanItem[] {
  const diesel = engine?.fuel === 'nafta'
  const electric = engine?.fuel === 'elektro'
  const hasTimingChain = /řetěz|chain|BMW|Mercedes/i.test(`${engine?.code ?? ''} ${engine?.faults.map((item) => item.name).join(' ') ?? ''}`)
  const items: ServicePlanItem[] = []
  if (!electric) items.push({ id: 'engine-oil', title: 'Motorový olej a filtr', description: 'Použijte specifikaci výrobce a zkraťte interval při městském provozu.', dueKm: nextKm(car.mileage, 15000), dueDate: futureDate(12), priority: 'high' })
  items.push({ id: 'filters', title: electric ? 'Kabinový filtr' : 'Vzduchový, palivový a kabinový filtr', description: 'Zkontrolujte stav filtrů a historii poslední výměny.', dueKm: nextKm(car.mileage, 30000), dueDate: futureDate(18), priority: 'medium' })
  items.push({ id: 'brakes', title: 'Brzdy a brzdová kapalina', description: 'Změřit tloušťku destiček a kotoučů, kapalinu měnit zpravidla po 2 letech.', dueKm: nextKm(car.mileage, 30000), dueDate: futureDate(12), priority: 'medium' })
  items.push({ id: 'gearbox', title: 'Převodový olej', description: car.transmission === 'manuální' ? 'Kontrola těsnosti a stavu oleje v manuální převodovce.' : 'Ověřit předepsaný interval oleje, filtru a adaptací převodovky.', dueKm: nextKm(car.mileage, 60000), dueDate: futureDate(24), priority: 'high' })
  if (!electric) items.push({ id: 'timing', title: hasTimingChain ? 'Kontrola rozvodového řetězu' : 'Rozvody', description: hasTimingChain ? 'Poslech za studena a kontrola korekcí časování diagnostikou.' : 'Ověřte datum a nájezd poslední výměny řemenu včetně vodní pumpy.', dueKm: nextKm(car.mileage, hasTimingChain ? 100000 : 120000), dueDate: futureDate(18), priority: 'high' })
  if (diesel) items.push({ id: 'emissions', title: 'Kontrola DPF a EGR', description: 'Diagnostika diferenčního tlaku, množství popela a funkce EGR.', dueKm: nextKm(car.mileage, 30000), dueDate: futureDate(12), priority: 'high' })
  if (electric || engine?.fuel === 'hybrid') items.push({ id: 'battery', title: 'Diagnostika trakční baterie', description: 'Změřit SOH, rozdíly článků a stav chladicího okruhu.', dueKm: nextKm(car.mileage, 30000), dueDate: futureDate(12), priority: 'medium' })
  return items
}
