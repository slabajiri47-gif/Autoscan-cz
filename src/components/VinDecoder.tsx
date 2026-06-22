import { useMemo, useState } from 'react'
import type { Engine, VinDecodeResult } from '../types'
import { createVinApiClient } from '../services/vinApi'

export function VinDecoder({ vin, engines, onVinChange, onDecoded }: { vin: string; engines: Engine[]; onVinChange: (vin: string) => void; onDecoded: (result: VinDecodeResult) => void }) {
  const client = useMemo(() => createVinApiClient(engines), [engines])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const decode = async () => {
    setLoading(true); setError(''); setSuccess('')
    try { const result = await client.decode(vin); onDecoded(result); setSuccess(`${result.make} ${result.model} · ${result.year}`) } catch (cause) { setError(cause instanceof Error ? cause.message : 'VIN se nepodařilo dekódovat.') } finally { setLoading(false) }
  }
  return <div className="field full vin-decoder"><label>VIN vozidla <small>{import.meta.env.VITE_VIN_API_KEY ? 'VIN API' : 'mock režim'}</small></label><div className="vin-input-row"><div className="input-icon"><i className="fa-solid fa-barcode" /><input value={vin} maxLength={17} placeholder="Např. WDD2120251A043863" onChange={(event) => { onVinChange(event.target.value.toUpperCase()); setError(''); setSuccess('') }} /></div><button className="secondary" disabled={vin.length !== 17 || loading} onClick={decode}>{loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-magnifying-glass" />} Dekódovat</button></div>{error && <p className="field-message error">{error}</p>}{success && <p className="field-message success"><i className="fa-solid fa-circle-check" /> {success}</p>}</div>
}
