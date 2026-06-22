import { useState } from 'react'
import type { ListingCandidate } from '../types'
import { parseListingUrl } from '../services/listingParser'
import { money, number } from '../utils/format'

export function ListingImport({ onAnalyze }: { onAnalyze: (candidate: ListingCandidate) => void }) {
  const [url, setUrl] = useState('')
  const [candidate, setCandidate] = useState<ListingCandidate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const parse = async () => {
    setLoading(true); setError(''); setCandidate(null)
    try { setCandidate(await parseListingUrl(url)) } catch (cause) { setError(cause instanceof Error ? cause.message : 'Import se nezdařil.') } finally { setLoading(false) }
  }

  return <div className="import-layout">
    <section className="panel import-panel"><span className="eyebrow">MOCK IMPORT INZERÁTU</span><h2>Vložte odkaz na nabídku</h2><p>Parser je připravený pro budoucí integrace. Nyní bezpečně vrací ukázková strukturovaná data podle zdroje.</p>
      <div className="listing-sources">{['Sauto','TipCars','Bazoš','Marketplace'].map((source) => <span key={source}>{source}</span>)}</div>
      <div className="field"><label>URL inzerátu</label><input value={url} placeholder="https://www.sauto.cz/osobni/detail/…" onChange={(event) => setUrl(event.target.value)} /></div>
      <button className="primary full-button" disabled={!url || loading} onClick={parse}>{loading ? <><i className="fa-solid fa-spinner fa-spin" /> Načítám…</> : <><i className="fa-solid fa-link" /> Načíst kandidáta</>}</button>
      {error && <p className="form-error"><i className="fa-solid fa-circle-exclamation" /> {error}</p>}
    </section>
    {candidate ? <section className="panel candidate-card"><span className="eyebrow">NALEZENÝ KANDIDÁT · {candidate.source}</span><h2>{candidate.title}</h2><dl><div><dt>Rok</dt><dd>{candidate.year}</dd></div><div><dt>Nájezd</dt><dd>{number(candidate.mileage)} km</dd></div><div><dt>Motor</dt><dd>{candidate.engineCode}</dd></div><div><dt>Převodovka</dt><dd>{candidate.transmission}</dd></div><div><dt>Cena</dt><dd>{money(candidate.askingPrice)}</dd></div></dl><button className="primary" onClick={() => onAnalyze(candidate)}><i className="fa-solid fa-wand-magic-sparkles" /> Převést do analýzy</button></section>
      : <section className="panel empty-state import-empty"><span><i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-link'}`} /></span><h3>{loading ? 'Zpracovávám inzerát' : 'Kandidát se zobrazí tady'}</h3><p>Žádná data se bez vašeho vloženého odkazu nevytvářejí.</p></section>}
  </div>
}
