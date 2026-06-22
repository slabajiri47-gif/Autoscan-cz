import type { jsPDF as JsPdf } from 'jspdf'
import { checklistItems } from '../data/engines'
import type { AnalysisResult } from '../types'

const ascii = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export async function exportAnalysisPdf(result: AnalysisResult, checklist: boolean[]) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const doc = new jsPDF()
  const reportDate = new Date(result.createdAt)
  const completed = checklist.filter(Boolean).length
  const brand = result.vehicleBrand || result.engine.brand
  const model = result.vehicleModel || result.engine.model
  const engine = result.engine.code ?? result.engine.id

  doc.setFillColor(10, 14, 18); doc.rect(0, 0, 210, 42, 'F')
  doc.setFillColor(183, 255, 60); doc.circle(20, 20, 9, 'F')
  doc.setTextColor(10, 14, 18); doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.text('A', 16.7, 24)
  doc.setTextColor(183, 255, 60); doc.setFontSize(21); doc.text('AUTOSCAN CZ', 34, 18)
  doc.setTextColor(225, 230, 230); doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.text('PROFESIONALNI PREDKUPNI REPORT', 34, 27)
  doc.text(`Vytvoreno: ${reportDate.toLocaleDateString('cs-CZ')}`, 157, 20)
  doc.text(`Report ID: ${result.id.slice(0, 8).toUpperCase()}`, 157, 27)

  doc.setTextColor(25, 30, 35); doc.setFont('helvetica', 'bold'); doc.setFontSize(17)
  doc.text(ascii(`${brand} ${model}`), 14, 56)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  const details = [
    ['VIN', result.vin || 'nezadano'], ['Rok', result.year?.toString() || 'nezadan'],
    ['Motor', engine], ['Palivo', result.engine.fuel || 'nezadano'],
    ['Prevodovka', result.transmission || 'nezadana'], ['Najezd', `${result.mileage.toLocaleString('cs-CZ')} km`],
  ]
  details.forEach(([label, value], index) => {
    const x = 14 + index % 3 * 64; const y = 67 + Math.floor(index / 3) * 13
    doc.setTextColor(100, 110, 112); doc.setFontSize(7); doc.text(ascii(label.toUpperCase()), x, y)
    doc.setTextColor(25, 30, 35); doc.setFontSize(10); doc.text(ascii(value), x, y + 5)
  })

  doc.setFillColor(244, 247, 241); doc.roundedRect(14, 96, 182, 26, 3, 3, 'F')
  doc.setTextColor(55, 65, 67); doc.setFontSize(8); doc.text('AUTOSCAN RISK SCORE', 20, 104)
  doc.setTextColor(result.score >= 75 ? 75 : result.score >= 55 ? 160 : 190, result.score >= 75 ? 125 : 85, 40); doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.text(`${result.score}/100`, 20, 116)
  doc.setTextColor(55, 65, 67); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.text('ODHAD REZERVY NA 1. ROK', 91, 104)
  doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.text(`${result.repairReserve.toLocaleString('cs-CZ')} Kc`, 91, 116)
  if (result.askingPrice) { doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.text('CENA INZERATU', 151, 104); doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text(`${result.askingPrice.toLocaleString('cs-CZ')} Kc`, 151, 116) }

  doc.setTextColor(25, 30, 35); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text('Typicke zavady a orientacni naklady', 14, 134)
  autoTable(doc, {
    startY: 139,
    head: [['Typicka zavada', 'Odhad vyskytu', 'Cena opravy', 'Zavaznost']],
    body: result.engine.faults.map((item) => [ascii(item.name), `${item.probability} %`, `${item.repairCost.toLocaleString('cs-CZ')} Kc`, ascii(item.severity)]),
    headStyles: { fillColor: [25, 30, 35], textColor: [183, 255, 60] },
    alternateRowStyles: { fillColor: [246, 248, 248] }, styles: { fontSize: 8, cellPadding: 2.7 },
  })
  const tableY = (doc as JsPdf & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 185
  let y = tableY + 11
  if (y > 225) { doc.addPage(); y = 18 }
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text('Doporuceni pred koupi', 14, y)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(55, 65, 67); doc.text(ascii(result.recommendation), 14, y + 7, { maxWidth: 182 })
  y += 30
  doc.setTextColor(25, 30, 35); doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(`Predkupni checklist: ${completed}/${checklist.length}`, 14, y)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7)
  checklistItems.forEach((item, index) => { const column = index >= 5 ? 1 : 0; const row = index % 5; doc.text(`${checklist[index] ? '[OK]' : '[  ]'} ${ascii(item)}`, 14 + column * 92, y + 7 + row * 5) })
  if (result.note) { y += 37; doc.setFont('helvetica', 'bold'); doc.text('Poznamka:', 14, y); doc.setFont('helvetica', 'normal'); doc.text(ascii(result.note), 31, y, { maxWidth: 165 }) }
  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) { doc.setPage(page); doc.setDrawColor(220, 225, 225); doc.line(14, 286, 196, 286); doc.setFontSize(7); doc.setTextColor(110, 118, 120); doc.text('AutoScan CZ · Vysledek je orientacni a nenahrazuje fyzickou prohlidku.', 14, 291); doc.text(`${page}/${pageCount}`, 190, 291) }
  doc.save(`autoscan-${result.vin || engine}-${reportDate.toISOString().slice(0, 10)}.pdf`)
}
