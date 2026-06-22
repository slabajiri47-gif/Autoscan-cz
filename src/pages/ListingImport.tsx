import { useState } from 'react'
import type { ListingCandidate, Transmission, VehicleCondition } from '../types'
import { parseListingUrl, type ListingParseResult } from '../services/listingParser'
import { money, number } from '../utils/format'

interface ManualForm { brand: string; model: string; year: string; mileage: string; engineCode: string; transmission: Transmission; askingPrice: string; condition: VehicleCondition }
const emptyManual: ManualForm = { brand: '', model: '', year: '', mileage: '', engineCode: '', transmission: 'manuální', askingPrice: '', condition: 'average' }

export function ListingImport({ onAnalyze }: { onAnalyze: (candidate: ListingCandidate) => void }) {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<ListingParseResult | null>(null)
  const [candidate, setCandidate] = useState<ListingCandidate | null>(null)
  const [manual, setManual] = useState(emptyManual)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const updateManual = <K extends keyof ManualForm>(key: K, value: ManualForm[K]) => setManual((current) => ({ ...current, [key]: value }))

  const parse = async () => {
    setLoading(true); setError(''); setCandidate(null); setResult(null); setManual(emptyManual)
    try { const parsed = await parseListingUrl(url); setResult(parsed); setCandidate(parsed.candidate ?? null) } catch (cause) { setError(cause instanceof Error ? cause.message : 'Import se nezdařil.') } finally { setLoading(false) }
  }
  const manualComplete = manual.brand && manual.model && manual.year && manual.mileage && manual.engineCode && manual.askingPrice
  const createManualCandidate = () => {
    if (!result || !manualComplete) return
    setCandidate({ id: crypto.randomUUID(), source: result.source, sourceUrl: result.sourceUrl, title: `${manual.brand} ${manual.model} ${manual.engineCode}`, brand: manual.brand, model: manual.model, year: Number(manual.year), mileage: Number(manual.mileage), engineCode: manual.engineCode, transmission: manual.transmission, askingPrice: Number(manual.askingPrice), condition: manual.condition })
  }

  return <div className="import-layout">
    <section className="panel import-panel"><span className="eyebrow">IMPORT INZERÁTU</span><h2>Vložte odkaz na nabídku</h2><p>Bez připojeného parser API aplikace obsah skutečného inzerátu nevymýšlí. Rozpozná zdroj a nechá vás opsat údaje z nabídky.</p>
      <div className="listing-sources">{['Sauto','TipCars','Bazoš','Marketplace'].map((source) => <span key={source}>{source}</span>)}</div>
      <div className="field"><label>URL inzerátu</label><input value={url} placeholder="https://www.sauto.cz/osobni/detail/…" onChange={(event) => setUrl(event.target.value)} /></div>
      <button className="primary full-button" disabled={!url || loading} onClick={parse}>{loading ? <><i className="fa-solid fa-spinner fa-spin" /> Kontroluji odkaz…</> : <><i className="fa-solid fa-link" /> Načíst odkaz</>}</button>
      {error && <p className="form-error"><i className="fa-solid fa-circle-exclamation" /> {error}</p>}
      {result?.mode === 'manual' && <div className="manual-import"><p className="catalog-warning"><i className="fa-solid fa-pen" /> Odkaz je z {result.source}, ale skutečný parser není připojený. Doplňte údaje z inzerátu ručně.</p><div className="form-grid">
        <div className="field"><label>Značka</label><input value={manual.brand} onChange={(event) => updateManual('brand', event.target.value)} /></div><div className="field"><label>Model</label><input value={manual.model} onChange={(event) => updateManual('model', event.target.value)} /></div>
        <div className="field"><label>Rok</label><input type="number" value={manual.year} onChange={(event) => updateManual('year', event.target.value)} /></div><div className="field"><label>Nájezd</label><input type="number" value={manual.mileage} onChange={(event) => updateManual('mileage', event.target.value)} /></div>
        <div className="field"><label>Motor</label><input value={manual.engineCode} onChange={(event) => updateManual('engineCode', event.target.value)} /></div><div className="field"><label>Cena</label><input type="number" value={manual.askingPrice} onChange={(event) => updateManual('askingPrice', event.target.value)} /></div>
        <div className="field"><label>Převodovka</label><select value={manual.transmission} onChange={(event) => updateManual('transmission', event.target.value as Transmission)}>{['manuální','automatická','DSG/DCT','CVT','jiná'].map((item) => <option key={item}>{item}</option>)}</select></div><div className="field"><label>Stav</label><select value={manual.condition} onChange={(event) => updateManual('condition', event.target.value as VehicleCondition)}><option value="excellent">Výborný</option><option value="good">Dobrý</option><option value="average">Průměrný</option><option value="poor">Špatný</option></select></div>
      </div><button className="secondary full-button" disabled={!manualComplete} onClick={createManualCandidate}><i className="fa-solid fa-check" /> Vytvořit kandidáta z vyplněných údajů</button></div>}
    </section>
    {candidate ? <section className="panel candidate-card"><span className="eyebrow">KANDIDÁT · {candidate.source} · {result?.mode === 'api' ? 'API' : 'RUČNĚ'}</span><h2>{candidate.title}</h2>{candidate.parserWarnings?.map((warning) => <p className="catalog-warning" key={warning}><i className="fa-solid fa-triangle-exclamation" /> {warning}</p>)}<dl><div><dt>Rok</dt><dd>{candidate.year || 'Nezjištěn'}</dd></div><div><dt>Nájezd</dt><dd>{candidate.mileage ? `${number(candidate.mileage)} km` : 'Nezjištěn'}</dd></div><div><dt>Motor</dt><dd>{candidate.engineCode || 'Nezjištěn'}</dd></div><div><dt>Převodovka</dt><dd>{candidate.transmission}</dd></div><div><dt>Cena</dt><dd>{candidate.askingPrice ? money(candidate.askingPrice) : 'Nezjištěna'}</dd></div></dl><button className="primary" onClick={() => onAnalyze(candidate)}><i className="fa-solid fa-wand-magic-sparkles" /> Převést do analýzy</button></section>
      : <section className="panel empty-state import-empty"><span><i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-link'}`} /></span><h3>{loading ? 'Kontroluji odkaz' : result?.mode === 'manual' ? 'Čekám na ruční údaje' : 'Kandidát se zobrazí tady'}</h3><p>{result?.mode === 'manual' ? 'Nevytvoříme falešné auto z pouhé domény odkazu.' : 'Žádná data se bez vašeho vloženého odkazu nevytvářejí.'}</p></section>}
  </div>
}
