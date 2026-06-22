import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { CostInputs } from '../types'
import { money } from '../utils/format'

const initial: CostInputs = { yearlyKm: 20000, consumption: 7, fuelPrice: 36, insurance: 12000, service: 18000, repairs: 25000 }
const colors = ['#b7ff3c', '#42b8ff', '#ffbd3e', '#ff665c']

export function Costs() {
  const [form, setForm] = useState(initial)
  const update = (key: keyof CostInputs, value: number) => setForm((current) => ({ ...current, [key]: value }))
  const data = useMemo(() => [
    { name: 'Palivo', value: form.yearlyKm / 100 * form.consumption * form.fuelPrice },
    { name: 'Pojištění', value: form.insurance }, { name: 'Běžný servis', value: form.service }, { name: 'Opravy', value: form.repairs },
  ], [form])
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const yearProjection = [1, 2, 3, 4, 5].map((year) => ({ year: `${year}. rok`, náklady: Math.round(total * year) }))
  return <>
    <section className="metric-grid costs-metrics"><article className="metric-card featured"><i className="fa-solid fa-calendar" /><div><span>Celkem ročně</span><strong>{money(total)}</strong><small>odhad provozních výdajů</small></div></article><article className="metric-card"><i className="fa-solid fa-calendar-days" /><div><span>Měsíčně</span><strong>{money(total / 12)}</strong><small>průměr za měsíc</small></div></article><article className="metric-card"><i className="fa-solid fa-road" /><div><span>Náklad na 1 km</span><strong>{form.yearlyKm ? (total / form.yearlyKm).toFixed(2) : '0'} Kč</strong><small>bez pořizovací ceny</small></div></article></section>
    <div className="content-grid costs-grid"><section className="panel"><div className="step-title"><span>01</span><div><span className="eyebrow">VSTUPNÍ DATA</span><h2>Roční provoz</h2></div></div><div className="form-grid">
      {([['yearlyKm','Roční nájezd','km'],['consumption','Spotřeba','l / 100 km'],['fuelPrice','Cena paliva','Kč / l'],['insurance','Pojištění','Kč / rok'],['service','Běžný servis','Kč / rok'],['repairs','Rezerva na opravy','Kč / rok']] as const).map(([key,label,suffix]) => <div className="field" key={key}><label>{label}</label><div className="input-suffix"><input type="number" min="0" value={form[key]} onChange={(e) => update(key, Number(e.target.value))} /><span>{suffix}</span></div></div>)}
    </div><div className="cost-note"><i className="fa-solid fa-circle-info" /> Výpočet nezahrnuje ztrátu hodnoty, financování ani dálniční poplatky.</div></section>
    <section className="panel chart-panel"><div className="panel-head"><div><span className="eyebrow">STRUKTURA NÁKLADŮ</span><h3>Kam peníze odcházejí</h3></div></div><div className="pie-wrap"><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={76} outerRadius={108} paddingAngle={3}>{data.map((_, index) => <Cell key={colors[index]} fill={colors[index]} />)}</Pie><Tooltip formatter={(value) => money(Number(value))} contentStyle={{ background: '#171d20', border: '1px solid #2a3336', borderRadius: 10 }} /><Legend /></PieChart></ResponsiveContainer><div className="pie-total"><small>CELKEM</small><strong>{Math.round(total / 1000)}k</strong><span>Kč / rok</span></div></div></section></div>
    <section className="panel projection"><div className="panel-head"><div><span className="eyebrow">DLOUHODOBÝ VÝHLED</span><h3>Kumulované náklady za 5 let</h3></div></div><ResponsiveContainer width="100%" height={280}><BarChart data={yearProjection}><CartesianGrid stroke="#273034" vertical={false} /><XAxis dataKey="year" stroke="#7f8b8e" /><YAxis stroke="#7f8b8e" tickFormatter={(value) => `${Math.round(value / 1000)}k`} /><Tooltip formatter={(value) => money(Number(value))} contentStyle={{ background: '#171d20', border: '1px solid #2a3336', borderRadius: 10 }} /><Bar dataKey="náklady" fill="#b7ff3c" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer></section>
  </>
}
