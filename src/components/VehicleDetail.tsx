import type { SavedCar } from '../types'
import { money, number, shortDate } from '../utils/format'
import { RiskBadge } from './RiskBadge'

export function VehicleDetail({ car, onClose, onEdit }: { car: SavedCar; onClose: () => void; onEdit: () => void }) {
  return <section className="vehicle-detail"><div className="vehicle-detail-head"><button className="text-button" onClick={onClose}><i className="fa-solid fa-arrow-left" /> Zpět do garáže</button><button className="secondary" onClick={onEdit}><i className="fa-solid fa-pen" /> Upravit</button></div>
    <div className="vehicle-identity"><span className="car-icon large"><i className="fa-solid fa-car-side" /></span><div><span className="eyebrow">DETAIL ULOŽENÉHO VOZU</span><h2>{car.brand} {car.model}</h2><p>{car.year || 'Rok neuveden'} · {car.transmission || 'Převodovka neuvedena'}</p></div><div className="detail-score"><strong>{car.score}</strong><RiskBadge score={car.score} /></div></div>
    <dl className="detail-grid"><div><dt>VIN</dt><dd>{car.vin || 'Neuvedeno'}</dd></div><div><dt>Motor</dt><dd>{car.engine?.code ?? car.engineId}</dd></div><div><dt>Nájezd</dt><dd>{number(car.mileage)} km</dd></div><div><dt>Majitelé</dt><dd>{car.owners}</dd></div><div><dt>Rezerva</dt><dd>{money(car.repairReserve)}</dd></div><div><dt>Uloženo</dt><dd>{shortDate(car.createdAt)}</dd></div>{car.askingPrice && <div><dt>Cena inzerátu</dt><dd>{money(car.askingPrice)}</dd></div>}</dl>
    {car.recommendation && <div className="recommendation"><i className="fa-solid fa-lightbulb" /><p>{car.recommendation}</p></div>}
    {car.engine?.faults.length ? <><h3>Typická rizika</h3><div className="fault-table">{car.engine.faults.map((item) => <div key={item.name}><span><b>{item.name}</b><small>{item.severity} závažnost</small></span><span>{item.probability} %</span><strong>{money(item.repairCost)}</strong></div>)}</div></> : null}
    {car.note && <div className="detail-note"><span>Poznámka</span><p>{car.note}</p></div>}
  </section>
}
