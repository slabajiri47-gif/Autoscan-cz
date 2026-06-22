import type { jsPDF as JsPdf } from 'jspdf'
import { checklistItems } from '../data/engines'
import type { AnalysisResult } from '../types'

const ascii = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export async function exportAnalysisPdf(result: AnalysisResult, checklist: boolean[]) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const doc = new jsPDF()
  const completed = checklist.filter(Boolean).length
  doc.setFillColor(10, 14, 18)
  doc.rect(0, 0, 210, 38, 'F')
  doc.setTextColor(183, 255, 60)
  doc.setFontSize(22)
  doc.text('AUTOSCAN CZ', 14, 19)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.text('Predkupni report vozidla', 14, 28)
  doc.setTextColor(25, 30, 35)
  doc.setFontSize(16)
  doc.text(ascii(`${result.engine.brand} · ${result.engine.model}`), 14, 51)
  doc.setFontSize(10)
  const details = [
    `VIN: ${result.vin || 'nezadano'}`, `Motor: ${result.engine.id}`,
    `Najezd: ${result.mileage.toLocaleString('cs-CZ')} km`, `Skore: ${result.score}/100`,
    `Doporucena rezerva: ${result.repairReserve.toLocaleString('cs-CZ')} Kc`,
  ]
  doc.text(ascii(details.join('\n')), 14, 61)
  doc.text(ascii(result.recommendation), 14, 91, { maxWidth: 180 })
  autoTable(doc, {
    startY: 112,
    head: [['Typicka zavada', 'Pravdepodobnost', 'Odhad opravy', 'Zavaznost']],
    body: result.engine.faults.map((item) => [ascii(item.name), `${item.probability} %`, `${item.repairCost.toLocaleString('cs-CZ')} Kc`, ascii(item.severity)]),
    headStyles: { fillColor: [25, 30, 35], textColor: [183, 255, 60] },
    styles: { fontSize: 8 },
  })
  const finalY = (doc as JsPdf & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 170
  doc.setFontSize(12)
  doc.text(`Checklist: ${completed}/${checklist.length} (${Math.round(completed / checklist.length * 100)} %)`, 14, finalY + 13)
  doc.setFontSize(8)
  checklistItems.forEach((item, index) => doc.text(`${checklist[index] ? '[OK]' : '[  ]'} ${ascii(item)}`, 14, finalY + 22 + index * 5))
  if (result.note) doc.text(ascii(`Poznamka: ${result.note}`), 14, finalY + 77, { maxWidth: 180 })
  doc.save(`autoscan-${result.vin || result.engine.id}-${new Date().toISOString().slice(0, 10)}.pdf`)
}
