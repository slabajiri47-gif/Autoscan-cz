import { riskMeta } from '../utils/format'

export function RiskBadge({ score }: { score: number }) {
  const risk = riskMeta(score)
  return <span className={`risk-badge ${risk.tone}`}><span />{risk.label}</span>
}
