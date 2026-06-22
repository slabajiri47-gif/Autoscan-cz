import { useEffect, useMemo, useState } from 'react'
import { checklistItems } from '../data/engines'
import { analyzeCar } from '../services/analysis'
import { exportAnalysisPdf } from '../services/pdf'
import type { AnalysisInput, AnalysisResult, Engine, SavedCar, ServiceHistory } from '../types'
import { money, number, riskMeta } from '../utils/format'
import { RiskBadge } from '../components/RiskBadge'

const defaults: AnalysisInput = { vin: '', engineId: '', mileage: 250000, age: 12, owners: 3, history: 'good', note: '' }

interface Props { engines: Engine[]; onSave: (result: AnalysisResult) => SavedCar[] }

export function Scan({ engines, onSave }: Props) {
  const [form, setForm] = useState(() => ({ ...defaults, engineId: engines[0]?.id ?? '' }))
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [checks, setChecks] = useState(checklistItems.map(() => false))
  const [notice, setNotice] = useState('')
  const selected = useMemo(() => engines.find((engine) => engine.id === form.engineId) ?? engines[0], [engines, form.engineId])
  useEffect(() => {
    if (engines.length && !engines.some((engine) => engine.id === form.engineId)) {
      setForm((current) => ({ ...current, engineId: engines[0].id }))
      setResult(null)
    }
  }, [engines, form.engineId])
  const update = <K extends keyof AnalysisInput>(key: K, value: AnalysisInput[K]) => setForm((current) => ({ ...current, [key]: value }))
  const analyze = () => { const next = analyzeCar(form, engines); setResult(next); setNotice(''); return next }
  const save = () => { const current = result ?? analyze(); onSave(current); setNotice('Vůz byl uložen do garáže.'); }
  const done = checks.filter(Boolean).length

  return <div className="scan-layout">
    <section className="panel form-panel"><div className="step-title"><span>01</span><div><span className="eyebrow">IDENTIFIKACE</span><h2>Údaje o vozidle</h2></div></div>
      <div className="field full"><label>VIN vozidla <small>demo rozpoznání podle prefixu</small></label><div className="input-icon"><i className="fa-solid fa-barcode" /><input value={form.vin} maxLength={17} placeholder="Např. WDD2120251A043863" onChange={(e) => update('vin', e.target.value.toUpperCase())} /></div></div>
      <div className="field full"><label>Motor / model <small>ověřený profil nebo modelový odhad</small></label><select value={form.engineId} onChange={(e) => update('engineId', e.target.value)}>{engines.map((engine) => <option key={engine.id} value={engine.id} disabled={engine.riskDataStatus === 'pending'}>{engine.brand} — {engine.code ?? engine.id} ({engine.model}){engine.riskDataStatus === 'estimated' ? ' · odhad' : engine.riskDataStatus === 'pending' ? ' · katalog' : ''}</option>)}</select></div>
      <div className="form-grid"><div className="field"><label>Nájezd</label><div className="input-suffix"><input type="number" min="0" value={form.mileage} onChange={(e) => update('mileage', Number(e.target.value))} /><span>km</span></div></div><div className="field"><label>Stáří vozu</label><div className="input-suffix"><input type="number" min="0" value={form.age} onChange={(e) => update('age', Number(e.target.value))} /><span>let</span></div></div></div>
      <div className="form-grid"><div className="field"><label>Počet majitelů</label><input type="number" min="1" value={form.owners} onChange={(e) => update('owners', Number(e.target.value))} /></div><div className="field"><label>Servisní historie</label><select value={form.history} onChange={(e) => update('history', e.target.value as ServiceHistory)}><option value="good">Doložená</option><option value="mid">Částečná</option><option value="bad">Chybí</option></select></div></div>
      <div className="field full"><label>Poznámka</label><textarea value={form.note} placeholder="Stav převodovky, kouřivost, provedené opravy…" onChange={(e) => update('note', e.target.value)} /></div>
      <button className="primary full-button" onClick={analyze}><i className="fa-solid fa-wand-magic-sparkles" /> Vyhodnotit vozidlo</button>
      <p className="privacy"><i className="fa-solid fa-lock" /> Data se neodesílají mimo toto zařízení.</p>
    </section>
    <div className="scan-results">
      {!result ? <section className="panel preview-panel"><div className="preview-engine"><span>{selected.brand}</span><strong>{selected.code ?? selected.id}</strong><p>{selected.model}</p></div><div className="preview-score"><span>Základní skóre motoru</span><strong>{selected.baseScore}<small>/100</small></strong><RiskBadge score={selected.baseScore} /></div><hr /><h3>Známá rizika v databázi</h3>{selected.faults.slice(0, 4).map((item) => <div className="fault-preview" key={item.name}><span className={`severity-dot ${item.severity}`} /><span>{item.name}</span><b>{item.probability} %</b></div>)}</section> : <section className="panel result-panel">
        <div className="result-top"><div><span className="eyebrow">VÝSLEDEK ANALÝZY</span><h2>{result.engine.brand} {result.engine.code ?? result.engine.id}</h2><p>{result.engine.model}</p></div><div className={`score-orb ${riskMeta(result.score).tone}`}><strong>{result.score}</strong><span>/100</span></div></div>
        <div className="result-kpis"><div><span>Hodnocení</span><RiskBadge score={result.score} /></div><div><span>Rezerva na 1. rok</span><strong>{money(result.repairReserve)}</strong></div><div><span>Nájezd</span><strong>{number(result.mileage)} km</strong></div></div>
        <div className="recommendation"><i className="fa-solid fa-lightbulb" /><p>{result.recommendation}</p></div>
        <h3>Typické závady</h3><div className="fault-table">{result.engine.faults.map((item) => <div key={item.name}><span><b>{item.name}</b><small>{item.severity} závažnost</small></span><span>{item.probability} %</span><strong>{money(item.repairCost)}</strong></div>)}</div>
        <div className="result-actions"><button className="primary" onClick={save}><i className="fa-solid fa-bookmark" /> Uložit</button><button className="secondary" onClick={() => exportAnalysisPdf(result, checks)}><i className="fa-solid fa-file-pdf" /> Export PDF</button></div>{notice && <p className="success-note"><i className="fa-solid fa-circle-check" /> {notice}</p>}
      </section>}
      <section className="panel checklist"><div className="panel-head"><div><span className="eyebrow">PŘEDKUPNÍ KONTROLA</span><h3>Checklist</h3></div><strong>{done}/{checks.length}</strong></div><div className="progress"><span style={{ width: `${done / checks.length * 100}%` }} /></div><div className="check-grid">{checklistItems.map((item, index) => <label key={item} className={checks[index] ? 'checked' : ''}><input type="checkbox" checked={checks[index]} onChange={() => setChecks((current) => current.map((value, i) => i === index ? !value : value))} /><span><i className="fa-solid fa-check" /></span>{item}</label>)}</div></section>
    </div>
  </div>
}
