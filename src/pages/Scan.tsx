import { useCallback, useEffect, useMemo, useState } from 'react'
import { checklistItems } from '../data/engines'
import { analyzeCar } from '../services/analysis'
import { exportAnalysisPdf } from '../services/pdf'
import type { AnalysisInput, AnalysisResult, Engine, ListingCandidate, ServiceHistory, Transmission, VehicleCondition, VinDecodeResult } from '../types'
import { money, number, riskMeta } from '../utils/format'
import { RiskBadge } from '../components/RiskBadge'
import { VinDecoder } from '../components/VinDecoder'
import { PriceEstimateCard } from '../components/PriceEstimateCard'
import { estimateUsedCarPrice } from '../services/priceEstimator'

const defaults: AnalysisInput = { vin: '', engineId: '', mileage: 0, age: 0, owners: 0, history: 'unknown', note: '' }

interface Props { engines: Engine[]; draft?: ListingCandidate | null; onDraftConsumed?: () => void; onSave: (result: AnalysisResult) => Promise<void> }

export function Scan({ engines, draft, onDraftConsumed, onSave }: Props) {
  const [form, setForm] = useState(defaults)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [checks, setChecks] = useState(checklistItems.map(() => false))
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const selected = useMemo(() => engines.find((engine) => engine.id === form.engineId), [engines, form.engineId])
  useEffect(() => {
    if (!draft) return
    const engine = engines.find((item) => (item.code ?? item.id).toLocaleLowerCase('cs') === draft.engineCode.toLocaleLowerCase('cs'))
    setForm((current) => ({ ...current, vin: draft.vin ?? '', engineId: engine?.id ?? '', mileage: draft.mileage, age: Math.max(0, new Date().getFullYear() - draft.year), year: draft.year, vehicleBrand: draft.brand, vehicleModel: draft.model, transmission: draft.transmission, askingPrice: draft.askingPrice, condition: draft.condition }))
    setResult(null); setNotice(`Kandidát z ${draft.source} byl načten.`); onDraftConsumed?.()
  }, [draft, engines, onDraftConsumed])
  const update = <K extends keyof AnalysisInput>(key: K, value: AnalysisInput[K]) => setForm((current) => ({ ...current, [key]: value }))
  const analyze = () => { if (!selected || !form.mileage) { setNotice('Vyberte motor a zadejte nájezd.'); return null } const next = analyzeCar({ ...form, estimatedPrice: priceEstimate?.fairPrice }, engines); setResult(next); setNotice(''); return next }
  const save = async () => { const current = result ?? analyze(); if (!current) return; setSaving(true); await onSave(current); setSaving(false); setNotice('Vůz byl uložen do garáže.') }
  const applyVin = useCallback((decoded: VinDecodeResult) => setForm((current) => ({ ...current, vin: decoded.vin, engineId: decoded.matchedEngine?.id ?? current.engineId, vehicleBrand: decoded.make, vehicleModel: decoded.model, year: decoded.year, age: Math.max(0, new Date().getFullYear() - decoded.year), transmission: decoded.transmission, mileage: decoded.mileage ?? current.mileage, owners: decoded.owners ?? current.owners, history: decoded.serviceHistory ?? current.history })), [])
  const priceEstimate = useMemo(() => form.vehicleBrand && form.vehicleModel && form.year && form.condition ? estimateUsedCarPrice({ brand: form.vehicleBrand, model: form.vehicleModel, year: form.year, mileage: form.mileage, engineCode: selected?.code ?? selected?.id ?? '', condition: form.condition, askingPrice: form.askingPrice }) : null, [form.vehicleBrand, form.vehicleModel, form.year, form.condition, form.mileage, form.askingPrice, selected])
  const done = checks.filter(Boolean).length

  return <div className="scan-layout">
    <section className="panel form-panel"><div className="step-title"><span>01</span><div><span className="eyebrow">IDENTIFIKACE</span><h2>Údaje o vozidle</h2></div></div>
      <VinDecoder vin={form.vin} engines={engines} onVinChange={(vin) => update('vin', vin)} onDecoded={applyVin} />
      <div className="field full"><label>Motor / model <small>ověřený profil nebo modelový odhad</small></label><select value={form.engineId} onChange={(e) => update('engineId', e.target.value)}><option value="" disabled>Vyberte motor…</option>{engines.map((engine) => <option key={engine.id} value={engine.id} disabled={engine.riskDataStatus === 'pending'}>{engine.brand} — {engine.code ?? engine.id} ({engine.model}){engine.riskDataStatus === 'estimated' ? ' · odhad' : engine.riskDataStatus === 'pending' ? ' · katalog' : ''}</option>)}</select></div>
      <div className="form-grid"><div className="field"><label>Značka</label><input value={form.vehicleBrand ?? ''} placeholder="Např. Škoda" onChange={(event) => update('vehicleBrand', event.target.value)} /></div><div className="field"><label>Model</label><input value={form.vehicleModel ?? ''} placeholder="Např. Octavia" onChange={(event) => update('vehicleModel', event.target.value)} /></div></div>
      <div className="form-grid"><div className="field"><label>Rok výroby</label><input type="number" min="1900" max={new Date().getFullYear() + 1} value={form.year ?? ''} onChange={(event) => { const year = Number(event.target.value) || undefined; update('year', year); if (year) update('age', Math.max(0, new Date().getFullYear() - year)) }} /></div><div className="field"><label>Převodovka</label><select value={form.transmission ?? ''} onChange={(event) => update('transmission', event.target.value as Transmission)}><option value="">Vyberte…</option>{['manuální','automatická','DSG/DCT','CVT','jiná'].map((item) => <option key={item}>{item}</option>)}</select></div></div>
      <div className="form-grid"><div className="field"><label>Nájezd</label><div className="input-suffix"><input type="number" min="0" value={form.mileage || ''} onChange={(e) => update('mileage', Number(e.target.value))} /><span>km</span></div></div><div className="field"><label>Stáří vozu</label><div className="input-suffix"><input type="number" min="0" value={form.age || ''} onChange={(e) => update('age', Number(e.target.value))} /><span>let</span></div></div></div>
      <div className="form-grid"><div className="field"><label>Počet majitelů</label><input type="number" min="1" value={form.owners || ''} onChange={(e) => update('owners', Number(e.target.value))} /></div><div className="field"><label>Servisní historie</label><select value={form.history} onChange={(e) => update('history', e.target.value as ServiceHistory)}><option value="unknown">Neuvedena</option><option value="good">Doložená</option><option value="mid">Částečná</option><option value="bad">Chybí</option></select></div></div>
      <div className="form-grid"><div className="field"><label>Cena inzerátu</label><div className="input-suffix"><input type="number" min="0" value={form.askingPrice ?? ''} onChange={(event) => update('askingPrice', Number(event.target.value) || undefined)} /><span>Kč</span></div></div><div className="field"><label>Deklarovaný stav</label><select value={form.condition ?? ''} onChange={(event) => update('condition', event.target.value as VehicleCondition)}><option value="">Vyberte…</option><option value="excellent">Výborný</option><option value="good">Dobrý</option><option value="average">Průměrný</option><option value="poor">Špatný</option></select></div></div>
      <div className="field full"><label>Poznámka</label><textarea value={form.note} placeholder="Stav převodovky, kouřivost, provedené opravy…" onChange={(e) => update('note', e.target.value)} /></div>
      <button className="primary full-button" onClick={analyze} disabled={!selected || !form.mileage}><i className="fa-solid fa-wand-magic-sparkles" /> Vyhodnotit vozidlo</button>
      <p className="privacy"><i className="fa-solid fa-lock" /> Data se neodesílají mimo toto zařízení.</p>
    </section>
    <div className="scan-results">
      {priceEstimate && <PriceEstimateCard estimate={priceEstimate} />}
      {!result ? selected ? <section className="panel preview-panel"><div className="preview-engine"><span>{selected.brand}</span><strong>{selected.code ?? selected.id}</strong><p>{selected.model}</p></div><div className="preview-score"><span>Základní skóre motoru</span><strong>{selected.baseScore}<small>/100</small></strong><RiskBadge score={selected.baseScore} /></div><hr /><h3>Známá rizika v databázi</h3>{selected.faults.slice(0, 4).map((item) => <div className="fault-preview" key={item.name}><span className={`severity-dot ${item.severity}`} /><span>{item.name}</span><b>{item.probability} %</b></div>)}</section> : <section className="panel empty-state scan-empty"><span><i className="fa-solid fa-car-side" /></span><h3>Začněte výběrem motoru</h3><p>Dokud nezvolíte konkrétní motorizaci, nezobrazujeme žádné předvyplněné vozidlo ani skóre.</p></section> : <section className="panel result-panel">
        <div className="result-top"><div><span className="eyebrow">VÝSLEDEK ANALÝZY</span><h2>{result.engine.brand} {result.engine.code ?? result.engine.id}</h2><p>{result.engine.model}</p></div><div className={`score-orb ${riskMeta(result.score).tone}`}><strong>{result.score}</strong><span>/100</span></div></div>
        <div className="result-kpis"><div><span>Hodnocení</span><RiskBadge score={result.score} /></div><div><span>Rezerva na 1. rok</span><strong>{money(result.repairReserve)}</strong></div><div><span>Nájezd</span><strong>{number(result.mileage)} km</strong></div></div>
        <div className="recommendation"><i className="fa-solid fa-lightbulb" /><p>{result.recommendation}</p></div>
        <h3>Typické závady</h3><div className="fault-table">{result.engine.faults.map((item) => <div key={item.name}><span><b>{item.name}</b><small>{item.severity} závažnost</small></span><span>{item.probability} %</span><strong>{money(item.repairCost)}</strong></div>)}</div>
        <div className="result-actions"><button className="primary" disabled={saving} onClick={() => void save()}><i className={`fa-solid ${saving ? 'fa-spinner fa-spin' : 'fa-bookmark'}`} /> {saving ? 'Ukládám…' : 'Uložit'}</button><button className="secondary" onClick={() => exportAnalysisPdf(result, checks)}><i className="fa-solid fa-file-pdf" /> Export PDF</button></div>{notice && <p className="success-note"><i className="fa-solid fa-circle-check" /> {notice}</p>}
      </section>}
      <section className="panel checklist"><div className="panel-head"><div><span className="eyebrow">PŘEDKUPNÍ KONTROLA</span><h3>Checklist</h3></div><strong>{done}/{checks.length}</strong></div><div className="progress"><span style={{ width: `${done / checks.length * 100}%` }} /></div><div className="check-grid">{checklistItems.map((item, index) => <label key={item} className={checks[index] ? 'checked' : ''}><input type="checkbox" checked={checks[index]} onChange={() => setChecks((current) => current.map((value, i) => i === index ? !value : value))} /><span><i className="fa-solid fa-check" /></span>{item}</label>)}</div></section>
    </div>
  </div>
}
