import { useMemo, useState } from 'react'
import type { Engine } from '../types'
import { money } from '../utils/format'
import { RiskBadge } from '../components/RiskBadge'

interface Props {
  engines: Engine[]
  source: 'supabase' | 'cache' | 'offline'
  loading: boolean
  warning?: string
}

const sourceLabels = {
  supabase: 'Online katalog',
  cache: 'Uložená kopie',
  offline: 'Offline základ',
}

export function EngineDatabase({ engines, source, loading, warning }: Props) {
  const [query, setQuery] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [fuel, setFuel] = useState('')
  const [limit, setLimit] = useState(60)

  const brands = useMemo(() => [...new Set(engines.map((engine) => engine.brand))].sort(), [engines])
  const models = useMemo(() => [...new Set(engines.filter((engine) => !brand || engine.brand === brand).map((engine) => engine.model))].sort(), [engines, brand])
  const fuels = useMemo(() => [...new Set(engines.flatMap((engine) => engine.fuel ? [engine.fuel] : []))].sort(), [engines])
  const selectedYear = Number(year)
  const normalizedQuery = query.trim().toLocaleLowerCase('cs')

  const filtered = useMemo(() => engines.filter((engine) => {
    const searchable = `${engine.code ?? engine.id} ${engine.brand} ${engine.model} ${engine.generation ?? ''} ${engine.faults.map((item) => item.name).join(' ')}`.toLocaleLowerCase('cs')
    const yearMatches = !selectedYear || ((!engine.yearFrom || engine.yearFrom <= selectedYear) && (!engine.yearTo || engine.yearTo >= selectedYear))
    return (!normalizedQuery || searchable.includes(normalizedQuery))
      && (!brand || engine.brand === brand)
      && (!model || engine.model === model)
      && (!fuel || engine.fuel === fuel)
      && yearMatches
  }), [engines, normalizedQuery, brand, model, fuel, selectedYear])

  const clearFilters = () => { setQuery(''); setBrand(''); setModel(''); setYear(''); setFuel(''); setLimit(60) }

  return <section className="panel database-panel">
    <div className="database-heading">
      <div><span className="eyebrow">ZNALOSTNÍ BÁZE</span><h2>Databáze motorů</h2><p>{filtered.length} z {engines.length} motorizací.</p></div>
      <div className={`catalog-source ${source}`}><i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : source === 'supabase' ? 'fa-cloud' : 'fa-database'}`} /> {loading ? 'Načítám katalog…' : sourceLabels[source]}</div>
    </div>
    {warning && <p className="catalog-warning"><i className="fa-solid fa-triangle-exclamation" /> Online katalog není dostupný, používám náhradní data. {warning}</p>}
    <div className="catalog-filters">
      <div className="search"><i className="fa-solid fa-magnifying-glass" /><input value={query} placeholder="Motor, model nebo závada…" onChange={(event) => { setQuery(event.target.value); setLimit(60) }} /></div>
      <select aria-label="Značka" value={brand} onChange={(event) => { setBrand(event.target.value); setModel(''); setLimit(60) }}><option value="">Všechny značky</option>{brands.map((item) => <option key={item}>{item}</option>)}</select>
      <select aria-label="Model" value={model} onChange={(event) => { setModel(event.target.value); setLimit(60) }}><option value="">Všechny modely</option>{models.map((item) => <option key={item}>{item}</option>)}</select>
      <input aria-label="Rok výroby" type="number" min="1900" max="2100" value={year} placeholder="Rok výroby" onChange={(event) => { setYear(event.target.value); setLimit(60) }} />
      <select aria-label="Palivo" value={fuel} onChange={(event) => { setFuel(event.target.value); setLimit(60) }}><option value="">Všechna paliva</option>{fuels.map((item) => <option key={item}>{item}</option>)}</select>
      <button className="secondary" onClick={clearFilters}><i className="fa-solid fa-rotate-left" /> Vymazat</button>
    </div>
    <div className="engine-grid">{filtered.slice(0, limit).map((engine) => <article className="engine-card" key={engine.id}>
      <div className="engine-card-head"><div><span>{engine.brand}</span><h3>{engine.code ?? engine.id}</h3><p>{engine.model}{engine.generation ? ` · ${engine.generation}` : ''}</p></div><div><strong>{engine.riskDataStatus === 'pending' ? '—' : engine.baseScore}</strong>{engine.riskDataStatus !== 'pending' && <small>/100</small>}</div></div>
      <div className="engine-specs">{(engine.yearFrom || engine.yearTo) && <span><i className="fa-regular fa-calendar" /> {engine.yearFrom ?? '…'}–{engine.yearTo ?? 'současnost'}</span>}{engine.fuel && <span><i className="fa-solid fa-gas-pump" /> {engine.fuel}</span>}{engine.powerKw && <span>{engine.powerKw} kW</span>}{engine.riskDataStatus === 'estimated' && <span className="estimated-label"><i className="fa-solid fa-calculator" /> odhad</span>}</div>
      <div className="engine-meta">{engine.riskDataStatus === 'pending' ? <span className="catalog-pending"><i className="fa-regular fa-clock" /> Čeká na rizikovou analýzu</span> : <><RiskBadge score={engine.baseScore} /><span>{engine.riskDataStatus === 'estimated' ? 'Modelový odhad · ' : ''}rezerva od {money(engine.repairReserve)}</span></>}</div>
      <h4>Typické závady</h4>{engine.faults.length ? engine.faults.slice(0, 4).map((item) => <div className="engine-fault" key={item.name}><span className={`severity-dot ${item.severity}`} /><span>{item.name}</span><b>{item.probability}%</b></div>) : <p className="catalog-no-faults">Riziková data zatím nejsou doplněna.</p>}
      {engine.purchaseRecommendation && <p className="engine-advice"><i className="fa-solid fa-lightbulb" /> {engine.purchaseRecommendation}</p>}
    </article>)}</div>
    {filtered.length > limit && <div className="catalog-more"><button className="secondary" onClick={() => setLimit((current) => current + 60)}>Zobrazit dalších {Math.min(60, filtered.length - limit)}</button></div>}
    {!filtered.length && <div className="empty-state compact-empty"><span><i className="fa-solid fa-magnifying-glass" /></span><h3>Nic jsme nenašli</h3><p>Zkuste změnit nebo vymazat filtry.</p></div>}
  </section>
}
