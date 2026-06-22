import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Engine, VinDecodeResult } from '../types'
import { createVinApiClient } from '../services/vinApi'

export function VinDecoder({ vin, engines, onVinChange, onDecoded }: { vin: string; engines: Engine[]; onVinChange: (vin: string) => void; onDecoded: (result: VinDecodeResult) => void }) {
  const client = useMemo(() => createVinApiClient(engines), [engines])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const lastAttempt = useRef('')
  const decode = useCallback(async (targetVin: string) => {
    setLoading(true); setError(''); setSuccess('')
    try { const result = await client.decode(targetVin); onDecoded(result); setSuccess(`${result.make} ${result.model} · ${result.year} · dostupné údaje doplněny`) } catch (cause) { setError(cause instanceof Error ? cause.message : 'VIN se nepodařilo dekódovat.') } finally { setLoading(false) }
  }, [client, onDecoded])
  useEffect(() => {
    const normalized = vin.trim().toUpperCase()
    if (normalized.length !== 17) { lastAttempt.current = ''; return }
    if (lastAttempt.current === normalized) return
    lastAttempt.current = normalized
    void decode(normalized)
  }, [vin, decode])
  return <div className="field full vin-decoder"><label>VIN vozidla <small>{import.meta.env.VITE_VIN_API_KEY ? 'VIN API · automaticky' : 'mock režim · automaticky'}</small></label><div className="vin-input-row"><div className="input-icon"><i className="fa-solid fa-barcode" /><input value={vin} maxLength={17} placeholder="Např. WDD2120251A043863" onChange={(event) => { onVinChange(event.target.value.toUpperCase()); setError(''); setSuccess('') }} /></div><button className="secondary" disabled={vin.length !== 17 || loading} onClick={() => void decode(vin)}>{loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-rotate" />} {loading ? 'Dohledávám…' : 'Načíst znovu'}</button></div>{error && <p className="field-message error">{error}</p>}{success && <p className="field-message success"><i className="fa-solid fa-circle-check" /> {success}</p>}<p className="vin-hint">VIN doplní technické údaje a dostupnou historii. Cenu inzerátu, skutečný stav a poznámku je nutné zadat ručně.</p></div>
}
