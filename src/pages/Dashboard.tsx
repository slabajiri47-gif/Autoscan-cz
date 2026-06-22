import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import type { SavedCar } from '../types'
import type { View } from '../components/Layout'
import { money, number, shortDate } from '../utils/format'
import { RiskBadge } from '../components/RiskBadge'

export function Dashboard({ cars, navigate, engineCount }: { cars: SavedCar[]; navigate: (view: View) => void; engineCount: number }) {
  const average = cars.length ? Math.round(cars.reduce((sum, car) => sum + car.score, 0) / cars.length) : 0
  const reserves = cars.reduce((sum, car) => sum + car.repairReserve, 0)
  const chart = [{ value: average || 1 }, { value: average ? 100 - average : 99 }]
  return <>
    <section className="hero-card">
      <div><span className="eyebrow lime">CHYTRÝ NÁKUP OJETINY</span><h2>Rozhodujte se podle dat,<br />ne podle lesku karoserie.</h2><p>Prověřte typické závady, spočítejte skutečné náklady a porovnejte kandidáty na jednom místě.</p><button className="primary" onClick={() => navigate('scan')}>Spustit novou analýzu <i className="fa-solid fa-arrow-right" /></button></div>
      <div className="hero-visual"><div className="scan-ring"><i className="fa-solid fa-car-side" /></div><span className="scan-label one">VIN CHECK <b>READY</b></span><span className="scan-label two">DATABÁZE <b>{engineCount} MOTORŮ</b></span></div>
    </section>
    <section className="metric-grid">
      <article className="metric-card"><i className="fa-solid fa-car" /><div><span>Uložená vozidla</span><strong>{cars.length}</strong><small>ve vaší garáži</small></div></article>
      <article className="metric-card"><i className="fa-solid fa-shield-halved" /><div><span>Průměrné skóre</span><strong>{average || '—'}{average > 0 && <small>/100</small>}</strong><small>{average >= 75 ? 'dobrý výsledek' : cars.length ? 'vyžaduje pozornost' : 'zatím bez dat'}</small></div></article>
      <article className="metric-card"><i className="fa-solid fa-toolbox" /><div><span>Celková rezerva</span><strong>{cars.length ? money(reserves) : '—'}</strong><small>pro první rok</small></div></article>
    </section>
    <div className="content-grid dashboard-grid">
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">POSLEDNÍ ANALÝZY</span><h3>Moje vozidla</h3></div><button className="text-button" onClick={() => navigate('garage')}>Zobrazit vše <i className="fa-solid fa-arrow-right" /></button></div>
        {cars.length ? <div className="car-list">{cars.slice(0, 3).map((car) => <button key={car.id} onClick={() => navigate('garage')}><span className="car-icon"><i className="fa-solid fa-car-side" /></span><span className="car-main"><strong>{car.brand} {car.model}</strong><small>{car.engineId} · {number(car.mileage)} km · {shortDate(car.createdAt)}</small></span><RiskBadge score={car.score} /><b className="score">{car.score}</b><i className="fa-solid fa-chevron-right" /></button>)}</div> : <div className="empty-inline"><i className="fa-solid fa-road" /><div><strong>Garáž čeká na první vůz</strong><p>Analýza zabere méně než minutu.</p></div><button className="secondary" onClick={() => navigate('scan')}>Začít</button></div>}
      </section>
      <section className="panel score-panel"><div className="panel-head"><div><span className="eyebrow">SKÓRE GARÁŽE</span><h3>Celkové zdraví</h3></div></div>
        <div className="gauge"><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={chart} dataKey="value" startAngle={210} endAngle={-30} innerRadius={64} outerRadius={78} stroke="none"><Cell fill="#b7ff3c" /><Cell fill="#222a2d" /></Pie></PieChart></ResponsiveContainer><div><strong>{average || '—'}</strong><span>{average ? '/ 100' : 'bez dat'}</span></div></div>
        <p>{cars.length ? 'Průměr vychází z uložených analýz. Čím vyšší skóre, tím nižší odhadované riziko.' : 'Uložte první analýzu a tady uvidíte souhrnné zdraví celé garáže.'}</p>
      </section>
    </div>
  </>
}
