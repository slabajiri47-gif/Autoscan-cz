import type { PriceEstimate } from '../types'
import { money } from '../utils/format'

const verdicts = { low: ['Nízká cena', 'good'], fair: ['Férová cena', 'fair'], high: ['Vysoká cena', 'high'] } as const

export function PriceEstimateCard({ estimate }: { estimate: PriceEstimate }) {
  const verdict = estimate.verdict ? verdicts[estimate.verdict] : undefined
  return <section className="price-estimate">
    <div><span>Odhad férové ceny</span><strong>{money(estimate.fairPrice)}</strong><small>{money(estimate.minPrice)} – {money(estimate.maxPrice)}</small></div>
    {verdict && <b className={`price-verdict ${verdict[1]}`}>{verdict[0]}</b>}
    <p>{estimate.explanation} Důvěra odhadu: {estimate.confidence === 'medium' ? 'střední' : 'nízká'}.</p>
  </section>
}
