import { useEffect, useMemo, useState } from 'react'
import type { Engine, SavedCar, ServiceReminder } from '../types'
import { createServicePlan } from '../services/servicePlan'
import { reminderRepository } from '../services/reminderRepository'
import { number, shortDate } from '../utils/format'

export function ServicePlan({ cars, engines }: { cars: SavedCar[]; engines: Engine[] }) {
  const [vehicleId, setVehicleId] = useState('')
  const [reminders, setReminders] = useState<ServiceReminder[]>([])
  const [notice, setNotice] = useState('')
  useEffect(() => { reminderRepository.list().then(setReminders) }, [])
  const car = cars.find((item) => item.id === vehicleId)
  const engine = car?.engine ?? engines.find((item) => item.id === car?.engineId)
  const plan = useMemo(() => car ? createServicePlan(car, engine) : [], [car, engine])
  const add = async (item: (typeof plan)[number]) => { if (!car) return; const reminder = await reminderRepository.add(car.id, item); setReminders((current) => [reminder, ...current]); setNotice(`Připomínka „${item.title}“ byla uložena.`) }

  return <div className="service-layout">
    <section className="panel service-selector"><span className="eyebrow">SERVISNÍ PLÁN</span><h2>Naplánujte údržbu</h2><p>Termíny jsou orientační. Vždy je porovnejte s plánem výrobce a doloženou historií.</p><div className="field"><label>Uložené vozidlo</label><select value={vehicleId} onChange={(event) => { setVehicleId(event.target.value); setNotice('') }}><option value="">Vyberte vozidlo…</option>{cars.map((item) => <option key={item.id} value={item.id}>{item.brand} {item.model} · {number(item.mileage)} km</option>)}</select></div>{notice && <p className="success-note"><i className="fa-solid fa-circle-check" /> {notice}</p>}
      {!cars.length && <div className="empty-inline"><i className="fa-solid fa-warehouse" /><div><strong>Nejdřív uložte analyzovaný vůz</strong><p>Servisní plán se vytvoří z motoru a aktuálního nájezdu.</p></div></div>}
    </section>
    <section className="panel service-plan-list"><div className="panel-head"><div><span className="eyebrow">DOPORUČENÉ ÚKONY</span><h3>{car ? `${car.brand} ${car.model}` : 'Čekám na výběr vozu'}</h3></div></div>{plan.length ? plan.map((item) => <article className="service-item" key={item.id}><span className={`service-priority ${item.priority}`}><i className="fa-solid fa-screwdriver-wrench" /></span><div><strong>{item.title}</strong><p>{item.description}</p><small>do {number(item.dueKm)} km · orientačně {shortDate(item.dueDate)}</small></div><button className="secondary" onClick={() => add(item)}><i className="fa-regular fa-bell" /> Připomenout</button></article>) : <div className="empty-state compact-empty"><span><i className="fa-solid fa-screwdriver-wrench" /></span><h3>Vyberte uložené auto</h3></div>}</section>
    <section className="panel reminder-list"><div className="panel-head"><div><span className="eyebrow">LOKÁLNÍ PŘIPOMÍNKY</span><h3>{reminders.length} uložených</h3></div></div>{reminders.length ? reminders.map((item) => <div className={`reminder-row ${item.completed ? 'completed' : ''}`} key={item.id}><button aria-label="Přepnout dokončení" onClick={async () => setReminders(await reminderRepository.toggle(item.id))}><i className={`fa-solid ${item.completed ? 'fa-circle-check' : 'fa-circle'}`} /></button><span><strong>{item.title}</strong><small>{shortDate(item.dueDate)} · {number(item.dueKm)} km</small></span><button aria-label="Smazat připomínku" onClick={async () => setReminders(await reminderRepository.remove(item.id))}><i className="fa-solid fa-trash" /></button></div>) : <p className="catalog-no-faults">Zatím nemáte žádné připomínky.</p>}</section>
  </div>
}
