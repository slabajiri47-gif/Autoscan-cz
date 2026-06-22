import type { AnalysisInput, AnalysisResult, Engine } from '../types'

export function resolveEngine(vin: string, engineId: string, engines: Engine[]): Engine {
  const normalized = vin.trim().toUpperCase()
  return engines.find((engine) => engine.vinPrefixes.some((prefix) => normalized.startsWith(prefix)))
    ?? engines.find((engine) => engine.id === engineId)
    ?? engines[0]
}

export function analyzeCar(input: AnalysisInput, engines: Engine[]): AnalysisResult {
  const engine = resolveEngine(input.vin, input.engineId, engines)
  let score = engine.baseScore
  if (input.mileage > 200_000) score -= 8
  if (input.mileage > 300_000) score -= 10
  if (input.mileage > 400_000) score -= 8
  if (input.age > 10) score -= 6
  if (input.age > 15) score -= 8
  if (input.owners > 2) score -= 5
  if (input.owners > 4) score -= 8
  if (input.history === 'mid') score -= 8
  if (input.history === 'bad') score -= 18
  score = Math.max(5, Math.min(98, score))

  const repairReserve = engine.repairReserve + Math.max(0, Math.round((input.mileage - 180_000) / 100_000)) * 5_000
  const recommendationBase = score < 55
    ? `Vůz zvažte pouze po důkladné diagnostice a s rezervou nejméně ${Math.round(engine.repairReserve * 1.5).toLocaleString('cs-CZ')} Kč. Zaměřte se na nejdražší typické závady.`
    : score < 75
      ? 'Použitelná volba, ale počítejte se servisní rezervou. Před koupí ověřte převodovku, DPF/EGR, úniky oleje a skutečný nájezd.'
      : 'Relativně dobrá volba, pokud odpovídá servisní historie a technický stav. Po koupi naplánujte preventivní servis.'
  const recommendation = engine.riskDataStatus === 'estimated'
    ? `Modelový odhad s nižší mírou jistoty: ${recommendationBase} Ověřte závěry podle přesného kódu motoru, roku výroby a servisních záznamů.`
    : recommendationBase

  return { ...input, vin: input.vin.trim().toUpperCase(), id: crypto.randomUUID(), createdAt: new Date().toISOString(), engine, score, repairReserve, recommendation }
}
