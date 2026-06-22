import { useState } from 'react'
import type { SavedCar, Transmission, VehicleCondition } from '../types'

export function VehicleEditor({ car, onCancel, onSave }: { car: SavedCar; onCancel: () => void; onSave: (car: SavedCar) => Promise<void> }) {
  const [form, setForm] = useState(car)
  const [saving, setSaving] = useState(false)
  const update = <K extends keyof SavedCar>(key: K, value: SavedCar[K]) => setForm((current) => ({ ...current, [key]: value }))
  const save = async () => { setSaving(true); await onSave(form); setSaving(false) }
  return <section className="vehicle-editor"><span className="eyebrow">ÚPRAVA VOZIDLA</span><h2>{car.brand} {car.model}</h2><div className="form-grid">
    <div className="field"><label>Značka</label><input value={form.brand} onChange={(event) => update('brand', event.target.value)} /></div><div className="field"><label>Model</label><input value={form.model} onChange={(event) => update('model', event.target.value)} /></div>
    <div className="field"><label>Rok výroby</label><input type="number" value={form.year ?? ''} onChange={(event) => update('year', Number(event.target.value) || undefined)} /></div><div className="field"><label>Nájezd</label><input type="number" value={form.mileage} onChange={(event) => update('mileage', Number(event.target.value))} /></div>
    <div className="field"><label>Převodovka</label><select value={form.transmission ?? ''} onChange={(event) => update('transmission', event.target.value as Transmission)}><option value="">Neuvedena</option>{['manuální','automatická','DSG/DCT','CVT','jiná'].map((item) => <option key={item}>{item}</option>)}</select></div><div className="field"><label>Stav</label><select value={form.condition ?? ''} onChange={(event) => update('condition', event.target.value as VehicleCondition)}><option value="">Neuveden</option><option value="excellent">Výborný</option><option value="good">Dobrý</option><option value="average">Průměrný</option><option value="poor">Špatný</option></select></div>
    <div className="field full"><label>VIN</label><input maxLength={17} value={form.vin} onChange={(event) => update('vin', event.target.value.toUpperCase())} /></div><div className="field full"><label>Poznámka</label><textarea value={form.note} onChange={(event) => update('note', event.target.value)} /></div>
  </div><div className="result-actions"><button className="primary" disabled={saving} onClick={save}>{saving ? 'Ukládám…' : 'Uložit změny'}</button><button className="secondary" onClick={onCancel}>Zrušit</button></div></section>
}
