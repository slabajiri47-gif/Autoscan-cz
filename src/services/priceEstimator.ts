import type { PriceEstimate, VehicleCondition } from '../types'

export interface PriceEstimateInput {
  brand: string
  model: string
  year: number
  mileage: number
  engineCode: string
  condition: VehicleCondition
  askingPrice?: number
}

const priceAnchors = [
  { pattern: /škoda.*octavia/i, newPrice: 780000 },
  { pattern: /škoda.*superb/i, newPrice: 1050000 },
  { pattern: /volkswagen.*golf/i, newPrice: 800000 },
  { pattern: /bmw.*3|bmw.*320/i, newPrice: 1250000 },
  { pattern: /bmw.*5|bmw.*520|bmw.*530/i, newPrice: 1650000 },
  { pattern: /mercedes.*e/i, newPrice: 1750000 },
  { pattern: /mercedes.*c/i, newPrice: 1300000 },
  { pattern: /audi.*a4/i, newPrice: 1300000 },
  { pattern: /audi.*a6/i, newPrice: 1750000 },
  { pattern: /ford.*focus/i, newPrice: 680000 },
  { pattern: /toyota.*corolla/i, newPrice: 720000 },
  { pattern: /toyota.*rav4/i, newPrice: 1050000 },
  { pattern: /hyundai.*i30|kia.*ceed/i, newPrice: 650000 },
  { pattern: /volvo.*xc60/i, newPrice: 1500000 },
]

const conditionFactor: Record<VehicleCondition, number> = { excellent: 1.1, good: 1, average: .88, poor: .7 }

export function estimateUsedCarPrice(input: PriceEstimateInput): PriceEstimate {
  const key = `${input.brand} ${input.model}`
  const anchor = priceAnchors.find((item) => item.pattern.test(key))
  const newPrice = anchor?.newPrice ?? 800000
  const age = Math.max(0, new Date().getFullYear() - input.year)
  const ageFactor = Math.max(.12, Math.pow(.84, age))
  const expectedKm = Math.max(12000, age * 16000)
  const mileageDelta = (input.mileage - expectedKm) / 100000
  const mileageFactor = Math.max(.62, Math.min(1.18, 1 - mileageDelta * .12))
  const engineFactor = /amg|\bm\d|rs\b|gti|type r/i.test(input.engineCode) ? 1.12 : /1\.0|1\.2/i.test(input.engineCode) ? .94 : 1
  const fairPrice = Math.max(35000, Math.round(newPrice * ageFactor * mileageFactor * conditionFactor[input.condition] * engineFactor / 5000) * 5000)
  const minPrice = Math.round(fairPrice * .88 / 5000) * 5000
  const maxPrice = Math.round(fairPrice * 1.12 / 5000) * 5000
  const verdict = input.askingPrice ? input.askingPrice < minPrice ? 'low' : input.askingPrice > maxPrice ? 'high' : 'fair' : undefined
  return {
    fairPrice, minPrice, maxPrice, verdict, confidence: anchor ? 'medium' : 'low',
    explanation: anchor
      ? 'Odhad vychází z interní cenové kotvy modelu, stáří, nájezdu, motoru a deklarovaného stavu.'
      : 'Pro tento model používáme obecnou cenovou kotvu. Výsledek berte jako hrubé rozpětí a porovnejte jej s trhem.',
  }
}
