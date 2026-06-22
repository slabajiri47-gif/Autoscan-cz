import { useState } from 'react'
import type { SavedCar } from '../types'
import { money, number, shortDate } from '../utils/format'
import { RiskBadge } from '../components/RiskBadge'
import { VehicleDetail } from '../components/VehicleDetail'
import { VehicleEditor } from '../components/VehicleEditor'

interface Props { cars: SavedCar[]; onDelete: (id: string) => Promise<void>; onClear: () => Promise<void>; onUpdate: (car: SavedCar) => Promise<void> }

export function Garage({ cars, onDelete, onClear, onUpdate }: Props) {
  const [selectedId, setSelectedId] = useState('')
  const [editing, setEditing] = useState(false)
  const selected = cars.find((car) => car.id === selectedId)
  if (selected && editing) return <section className="panel garage-panel"><VehicleEditor car={selected} onCancel={() => setEditing(false)} onSave={async (car) => { await onUpdate(car); setEditing(false) }} /></section>
  if (selected) return <section className="panel garage-panel"><VehicleDetail car={selected} onClose={() => setSelectedId('')} onEdit={() => setEditing(true)} /></section>

  return <section className="panel garage-panel"><div className="panel-head"><div><span className="eyebrow">LOKÁLNÍ ÚLOŽIŠTĚ · PŘIPRAVENO PRO ÚČET</span><h2>Uložená vozidla</h2><p>{cars.length} {cars.length === 1 ? 'vůz' : cars.length > 1 && cars.length < 5 ? 'vozy' : 'vozidel'} v garáži</p></div>{cars.length > 0 && <button className="danger-button" onClick={() => { if (confirm('Opravdu smazat všechna uložená auta?')) void onClear() }}><i className="fa-solid fa-trash" /> Smazat vše</button>}</div>
    {cars.length ? <div className="garage-grid">{cars.map((car) => <article className="garage-card" key={car.id}><div className="garage-card-top"><span className="car-icon large"><i className="fa-solid fa-car-side" /></span><RiskBadge score={car.score} /></div><h3>{car.brand}</h3><p>{car.model}</p><div className="garage-score"><strong>{car.score}</strong><span>/100<br />AUTOSCAN SKÓRE</span></div><dl><div><dt>Motor</dt><dd>{car.engine?.code ?? car.engineId}</dd></div><div><dt>Nájezd</dt><dd>{number(car.mileage)} km</dd></div><div><dt>Rezerva</dt><dd>{money(car.repairReserve)}</dd></div><div><dt>Uloženo</dt><dd>{shortDate(car.createdAt)}</dd></div></dl><div className="garage-actions"><button className="secondary" onClick={() => setSelectedId(car.id)}><i className="fa-solid fa-eye" /> Detail</button><button aria-label="Upravit vůz" onClick={() => { setSelectedId(car.id); setEditing(true) }}><i className="fa-solid fa-pen" /></button><button aria-label="Smazat vůz" onClick={() => void onDelete(car.id)}><i className="fa-solid fa-trash" /></button></div></article>)}</div> : <div className="empty-state"><span><i className="fa-solid fa-warehouse" /></span><h3>Garáž je zatím prázdná</h3><p>Po analýze si vůz uložte. Nevytváříme žádná ukázková auta bez vašeho vstupu.</p></div>}
  </section>
}
